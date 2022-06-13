import { AddableUserLogin, UserLogin } from "../interfaces/user-login";
import {
  AddableUserLoginListItem,
  PersistedUserLoginListItem,
} from "../interfaces/user-login-sp";
import { logTrace } from "../utilties/logging";
import { getWorkforcePortalConfig } from "./configuration-service";
import {
  applyToItemsByFilter,
  createItem,
  deleteItem,
  updateItem,
} from "./sp-service";

const workforcePortalConfig = getWorkforcePortalConfig();
const workforceSiteUrl = workforcePortalConfig.spSiteUrl;
const userLoginsListGuid = workforcePortalConfig.spLoginsListGuid;

export const getUserLoginByIdentityProviderUserId = async (
  identityProviderUserId: string
): Promise<UserLogin | null> => {
  const users = await getUserLoginsByFilters(
    `IdentityProviderUserId eq '${identityProviderUserId}'`
  );
  if (users?.length) {
    return users[0];
  } else {
    return null;
  }
};

export const getUserLoginsByProfileId = async (profileId: string) => {
  return await getUserLoginsByFilters(`ProfileId eq '${profileId}'`);
};

export const deleteUserLogin = async (userLogin: UserLogin) => {
  logTrace(`deleteUserLogin: Deleting login with DB ID: ${userLogin.dbId}`);

  await deleteItem(workforceSiteUrl, userLoginsListGuid, userLogin.dbId);
};

export const createUserLoginListItem = async (
  user: AddableUserLogin
): Promise<UserLogin> => {
  const addResult = await createItem<AddableUserLoginListItem>(
    workforceSiteUrl,
    userLoginsListGuid,
    addableUserLoginToListItem(user)
  );
  return listItemToUserLogin(addResult.data);
};

export const updateUserLoginListItem = async (
  user: UserLogin
): Promise<UserLogin> => {
  const listItem = addableUserLoginToListItem(user);
  await updateItem(workforceSiteUrl, userLoginsListGuid, user.dbId, listItem);
  return user;
};

export const getUserLoginsByFilters = async (
  filter?: string
): Promise<UserLogin[]> => {
  return applyToItemsByFilter<PersistedUserLoginListItem, UserLogin>(
    workforceSiteUrl,
    userLoginsListGuid,
    (items: PersistedUserLoginListItem[]) => {
      return Promise.resolve(items.map(listItemToUserLogin));
    },
    filter
  );
};

const listItemToUserLogin = (item: PersistedUserLoginListItem): UserLogin => {
  return {
    profileId: item.ProfileId,
    email: item.Email,
    displayName: item.Title,
    givenName: item.GivenName,
    surname: item.Surname,
    identityProvider: item.IdentityProvider,
    identityProviderUserId: item.IdentityProviderUserId,
    identityProviderUserDetails: item.IdentityProviderUserDetails,
    dbId: item.ID,
  };
};

const addableUserLoginToListItem = (
  userLogin: AddableUserLogin
): AddableUserLoginListItem => {
  return {
    Title: userLogin.displayName,
    ProfileId: userLogin.profileId,
    Email: userLogin.email,
    GivenName: userLogin.givenName,
    Surname: userLogin.surname,
    IdentityProvider: userLogin.identityProvider,
    IdentityProviderUserId: userLogin.identityProviderUserId,
    IdentityProviderUserDetails: userLogin.identityProviderUserDetails,
  };
};

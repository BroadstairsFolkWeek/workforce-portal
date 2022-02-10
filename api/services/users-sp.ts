import { IFileAddResult } from "@pnp/sp-commonjs";
import { AddableUserLogin, UserLogin } from "../interfaces/user-login";
import {
  AddableUserLoginListItem,
  PersistedUserLoginListItem,
} from "../interfaces/user-login-sp";
import { getWorkforcePortalConfig } from "./configuration-service";
import {
  addFileToFolder,
  applyToItemsByFilter,
  createItem,
  isFileinFolderExists,
  updateItem,
} from "./sp-service";

const workforcePortalConfig = getWorkforcePortalConfig();
const workforceSiteUrl = workforcePortalConfig.spSiteUrl;
const userLoginsListGuid = workforcePortalConfig.spLoginsListGuid;
const userPhotosServerRelativeUrl =
  workforcePortalConfig.spWorkforcePhotosServerRelativeUrl;

export const getUserLogin = async (
  userId: string
): Promise<UserLogin | null> => {
  const users = await getUsersByFilters(
    `IdentityProviderUserId eq '${userId}'`
  );
  if (users?.length) {
    return users[0];
  } else {
    return null;
  }
};

export const createUserListItem = async (
  user: AddableUserLogin
): Promise<UserLogin> => {
  const addResult = await createItem<AddableUserLoginListItem>(
    workforceSiteUrl,
    userLoginsListGuid,
    addableUserLoginToListItem(user)
  );
  return listItemToUserLogin(addResult.data);
};

export const updateUserListItem = async (
  user: UserLogin
): Promise<UserLogin> => {
  const listItem = addableUserLoginToListItem(user);
  await updateItem(workforceSiteUrl, userLoginsListGuid, user.dbId, listItem);
  return user;
};

export const getUsersByFilters = async (
  filter?: string
): Promise<UserLogin[]> => {
  return applyToItemsByFilter<PersistedUserLoginListItem, UserLogin[]>(
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
    email: item.Email,
    displayName: item.Title,
    givenName: item.GivenName,
    surname: item.Surname,
    telephone: item.Telephone,
    address: item.Address,
    photoRequired: item.PhotoRequired === undefined ? true : item.PhotoRequired,
    identityProvider: item.IdentityProvider,
    identityProviderUserId: item.IdentityProviderUserId,
    identityProviderUserDetails: item.IdentityProviderUserDetails,
    dbId: item.ID,
    version: item.Version ?? 1,
  };
};

const addableUserLoginToListItem = (
  user: AddableUserLogin
): AddableUserLoginListItem => {
  return {
    Title: user.displayName,
    Email: user.email,
    GivenName: user.givenName,
    Surname: user.surname,
    Telephone: user.telephone,
    Address: user.address,
    PhotoRequired: user.photoRequired,
    IdentityProvider: user.identityProvider,
    IdentityProviderUserId: user.identityProviderUserId,
    IdentityProviderUserDetails: user.identityProviderUserDetails,
    Version: user.version,
  };
};

export const addProfilePhotoItem = async (
  fileBaseName: string,
  fileExtension: string,
  imageContent: Buffer
): Promise<IFileAddResult | "FILE_ALREADY_EXISTS"> => {
  let filenameSuffix = 0;

  while (filenameSuffix < 5) {
    const candidateFilename =
      fileBaseName +
      (filenameSuffix ? "-" + filenameSuffix : "") +
      "." +
      fileExtension;
    if (
      !(await isFileinFolderExists(
        workforceSiteUrl,
        userPhotosServerRelativeUrl,
        candidateFilename
      ))
    ) {
      const addResult = await addFileToFolder(
        workforceSiteUrl,
        userPhotosServerRelativeUrl,
        fileBaseName + "." + fileExtension,
        imageContent
      );

      console.log("File add result:", JSON.stringify(addResult, null, 2));
      return addResult;
    }

    filenameSuffix++;
  }

  return "FILE_ALREADY_EXISTS";
};

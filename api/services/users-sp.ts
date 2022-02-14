import { IFileAddResult, IItem } from "@pnp/sp-commonjs";
import { AddableUserLogin, UserLogin } from "../interfaces/user-login";
import {
  AddableUserLoginListItem,
  PersistedUserLoginListItem,
} from "../interfaces/user-login-sp";
import { PersistedUserPhotoListItem } from "../interfaces/user-photo-sp";
import { logTrace } from "../utilties/logging";
import { getWorkforcePortalConfig } from "./configuration-service";
import {
  addFileToFolder,
  applyToItemsByFilter,
  applyToPagedItemsdByFilter,
  createItem,
  deleteFileByUniqueId,
  deleteFileForListItem,
  deleteItem,
  getImageFileForUniqueId,
  getLibraryAsList,
  updateItem,
} from "./sp-service";

const workforcePortalConfig = getWorkforcePortalConfig();
const workforceSiteUrl = workforcePortalConfig.spSiteUrl;
const userLoginsListGuid = workforcePortalConfig.spLoginsListGuid;
const userPhotosServerRelativeUrl =
  workforcePortalConfig.spWorkforcePhotosServerRelativeUrl;
const userPhotosDocumentLibraryTitle =
  workforcePortalConfig.spWorkforcePhotosLibraryTitle;

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
  return applyToItemsByFilter<PersistedUserLoginListItem, UserLogin>(
    workforceSiteUrl,
    userLoginsListGuid,
    (items: PersistedUserLoginListItem[]) => {
      return Promise.resolve(items.map(listItemToUserLogin));
    },
    filter
  );
};

const listItemToPhotoIds = (
  item: PersistedUserLoginListItem
): UserLogin["photoIds"] => {
  const photoIdsText = item.PhotoIds;
  if (photoIdsText) {
    return photoIdsText.split("\n").map((id) => id.trim());
  } else {
    return [];
  }
};

const listItemToUserLogin = (item: PersistedUserLoginListItem): UserLogin => {
  return {
    email: item.Email,
    displayName: item.Title,
    givenName: item.GivenName,
    surname: item.Surname,
    telephone: item.Telephone,
    address: item.Address,
    photoIds: listItemToPhotoIds(item),
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
    PhotoIds: user.photoIds.join("\n"),
    IdentityProvider: user.identityProvider,
    IdentityProviderUserId: user.identityProviderUserId,
    IdentityProviderUserDetails: user.identityProviderUserDetails,
    Version: user.version,
  };
};

export const getUserPhotosListItemsByFilters = async (
  filter?: string
): Promise<PersistedUserPhotoListItem[]> => {
  const photosList = await getLibraryAsList(
    workforceSiteUrl,
    userPhotosDocumentLibraryTitle
  );

  const appliedFunction = (listItems: PersistedUserPhotoListItem[]) =>
    Promise.resolve(listItems);
  return applyToPagedItemsdByFilter<PersistedUserPhotoListItem>(
    workforceSiteUrl,
    photosList.Id,
    appliedFunction,
    filter
  );
};

const getUserPhotosByUserId = async (
  identityProviderUserId: string
): Promise<PersistedUserPhotoListItem[]> => {
  return getUserPhotosListItemsByFilters(
    `IdentityProviderUserId eq '${identityProviderUserId}'`
  );
};

export const deletePhotoByListItemId = async (
  itemId: number
): Promise<void> => {
  const photosList = await getLibraryAsList(
    workforceSiteUrl,
    userPhotosDocumentLibraryTitle
  );

  return deleteItem(workforceSiteUrl, photosList.Id, itemId);
};

export const deletePhotoByUniqueId = async (
  uniqueId: string
): Promise<void> => {
  return deleteFileByUniqueId(workforceSiteUrl, uniqueId);
};

export const addProfilePhotoFileWithItem = async (
  fileBaseName: string,
  fileExtension: string,
  imageContent: Buffer,
  identityProviderUserId: string,
  givenName: string,
  surname: string,
  photoId: string
): Promise<IFileAddResult> => {
  let newFilename = fileBaseName + "." + fileExtension;

  logTrace("addProfilePhoto: Adding file: " + newFilename);
  const addResult = await addFileToFolder(
    workforceSiteUrl,
    userPhotosServerRelativeUrl,
    newFilename,
    imageContent
  );

  logTrace(
    "addProfilePhoto: File added. Setting associated metadata (columns)."
  );
  const associatedItem: IItem = await addResult.file.getItem();
  await associatedItem.update({
    Title: newFilename,
    IdentityProviderUserId: identityProviderUserId,
    PhotoId: photoId,
    GivenName: givenName,
    Surname: surname,
  });

  return addResult;
};

export const getProfilePhotoFileByUniqueId = async (uniqueId: string) => {
  return getImageFileForUniqueId(workforceSiteUrl, uniqueId);
};

export const deleteProfilePhotoFile = async (
  identityProviderUserId: string
): Promise<boolean> => {
  const existingUserPhotoListItems = await getUserPhotosByUserId(
    identityProviderUserId
  );

  if (existingUserPhotoListItems && existingUserPhotoListItems.length) {
    const selectedFile =
      existingUserPhotoListItems[existingUserPhotoListItems.length - 1];

    const photosList = await getLibraryAsList(
      workforceSiteUrl,
      userPhotosDocumentLibraryTitle
    );

    return deleteFileForListItem(
      workforceSiteUrl,
      photosList.Id,
      selectedFile.ID
    )
      .then(() => true)
      .catch(() => false);
  } else {
    return false;
  }
};

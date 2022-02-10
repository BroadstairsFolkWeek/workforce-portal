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
  deleteFileForListItem,
  deleteItem,
  getImageFileForListItem,
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
const maxPhotosPerPerson = workforcePortalConfig.maxProfilePhotosPerPerson;

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

const deletePhotoByListItemId = async (itemId: number): Promise<void> => {
  const photosList = await getLibraryAsList(
    workforceSiteUrl,
    userPhotosDocumentLibraryTitle
  );

  return deleteItem(workforceSiteUrl, photosList.Id, itemId);
};

export const addProfilePhotoFileWithItem = async (
  fileBaseName: string,
  fileExtension: string,
  imageContent: Buffer,
  identityProviderUserId: string,
  givenName: string,
  surname: string
): Promise<IFileAddResult | "COULD_NOT_DETERMINE_NEW_FILENAME"> => {
  const existingUserPhotoListItems = await getUserPhotosByUserId(
    identityProviderUserId
  );

  logTrace(
    "addProfilePhoto: Number of photos that already exist for user: " +
      existingUserPhotoListItems.length
  );

  // Delete older photos if adding this new photo will breach the limit on the number of
  // photos stored per user.
  while (existingUserPhotoListItems.length >= maxPhotosPerPerson) {
    const oldestPhotoListItem = existingUserPhotoListItems[0];
    logTrace("addProfilePhoto: Deleting photo: " + oldestPhotoListItem.Title);
    await deletePhotoByListItemId(oldestPhotoListItem.ID);
    existingUserPhotoListItems.shift();
  }

  // Build the list of exiting filenames to check against when generating the filename
  // for the new photo.
  const existingFilenames = existingUserPhotoListItems.map(
    (item) => item.Title
  );
  logTrace(
    `addProfilePhoto: Existing photo filenames: [${existingFilenames.join(
      ", "
    )}]`
  );

  let newFilename;
  let filenameSuffix = 0;
  while (filenameSuffix < maxPhotosPerPerson) {
    const candidateFilename =
      fileBaseName +
      (filenameSuffix ? "-" + filenameSuffix : "") +
      "." +
      fileExtension;

    logTrace(
      "addProfilePhoto: checking if candidate filename in use: " +
        candidateFilename
    );

    const fileExists = existingFilenames.find((ef) => ef === candidateFilename);
    if (!fileExists) {
      newFilename = candidateFilename;
      break;
    }
    filenameSuffix++;
  }

  if (newFilename) {
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
      GivenName: givenName,
      Surname: surname,
    });

    return addResult;
  }

  return "COULD_NOT_DETERMINE_NEW_FILENAME";
};

export const getProfilePhotoFile = async (
  identityProviderUserId: string,
  index: number
) => {
  const existingUserPhotoListItems = await getUserPhotosByUserId(
    identityProviderUserId
  );

  if (
    existingUserPhotoListItems &&
    existingUserPhotoListItems.length &&
    existingUserPhotoListItems.length > index
  ) {
    const selectedFile =
      existingUserPhotoListItems[existingUserPhotoListItems.length - 1 - index];

    const photosList = await getLibraryAsList(
      workforceSiteUrl,
      userPhotosDocumentLibraryTitle
    );

    return getImageFileForListItem(
      workforceSiteUrl,
      photosList.Id,
      selectedFile.ID
    );
  } else {
    return null;
  }
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

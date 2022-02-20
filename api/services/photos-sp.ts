import { IFileAddResult } from "@pnp/sp-commonjs";
import { Photo, UpdatablePhoto } from "../interfaces/photo";
import {
  AddableUserPhotoListItem,
  PersistedUserPhotoListItem,
  UpdatableUserPhotoListItem,
} from "../interfaces/photo-sp";
import { logTrace } from "../utilties/logging";
import { getWorkforcePortalConfig } from "./configuration-service";
import {
  addFileToFolder,
  deleteFileByUniqueId,
  deleteItem,
  getItemRefForUniqueFileId,
  getImageFileForUniqueId,
  getLibraryAsList,
  updateItemForUniqueFileId,
} from "./sp-service";

const workforcePortalConfig = getWorkforcePortalConfig();
const workforceSiteUrl = workforcePortalConfig.spSiteUrl;
const userPhotosServerRelativeUrl =
  workforcePortalConfig.spWorkforcePhotosServerRelativeUrl;
const userPhotosDocumentLibraryTitle =
  workforcePortalConfig.spWorkforcePhotosLibraryTitle;

const listItemToPhoto = (item: PersistedUserPhotoListItem): Photo => {
  return {
    title: item.Title,
    profileId: item.ProfileId,
    applicationId: item.ApplicationId,
    givenName: item.GivenName,
    surname: item.Surname,
    dbId: item.ID,
  };
};

const photoToUpdatableListItem = (
  photo: UpdatablePhoto
): UpdatableUserPhotoListItem => {
  return {
    Title: photo.title,
    ProfileId: photo.profileId,
    ApplicationId: photo.applicationId,
    GivenName: photo.givenName,
    Surname: photo.surname,
  };
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
  profileId: string,
  givenName: string,
  surname: string,
  photoId: string
): Promise<IFileAddResult> => {
  let newFilename = fileBaseName + "." + fileExtension;

  const photoItem: AddableUserPhotoListItem = {
    Title: newFilename,
    PhotoId: photoId,
    ProfileId: profileId,
    GivenName: givenName,
    Surname: surname,
  };

  logTrace("addProfilePhoto: Adding file: " + newFilename);
  const addResult = await addFileToFolder(
    workforceSiteUrl,
    userPhotosServerRelativeUrl,
    newFilename,
    imageContent,
    photoItem
  );

  return addResult;
};

export const getProfilePhotoFileByUniqueId = async (uniqueId: string) => {
  return getImageFileForUniqueId(workforceSiteUrl, uniqueId);
};

export const getProfilePhotoByUniqueFileIdId = async (
  uniqueId: string
): Promise<Photo> => {
  const photoFileItem = await getItemRefForUniqueFileId(
    workforceSiteUrl,
    uniqueId
  );

  const photoListItem = await photoFileItem.get<PersistedUserPhotoListItem>();
  return listItemToPhoto(photoListItem);
};

export const updateProfilePhotoByUniqueFileId = async (
  uniqueId: string,
  photo: UpdatablePhoto
) => {
  return updateItemForUniqueFileId(
    workforceSiteUrl,
    uniqueId,
    photoToUpdatableListItem(photo)
  );
};

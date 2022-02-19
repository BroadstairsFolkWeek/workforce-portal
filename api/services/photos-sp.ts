import { IFileAddResult, IItem } from "@pnp/sp-commonjs";
import { logTrace } from "../utilties/logging";
import { getWorkforcePortalConfig } from "./configuration-service";
import {
  addFileToFolder,
  deleteFileByUniqueId,
  deleteItem,
  getImageFileForUniqueId,
  getLibraryAsList,
} from "./sp-service";

const workforcePortalConfig = getWorkforcePortalConfig();
const workforceSiteUrl = workforcePortalConfig.spSiteUrl;
const userPhotosServerRelativeUrl =
  workforcePortalConfig.spWorkforcePhotosServerRelativeUrl;
const userPhotosDocumentLibraryTitle =
  workforcePortalConfig.spWorkforcePhotosLibraryTitle;

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
    PhotoId: photoId,
    ProfileId: profileId,
    GivenName: givenName,
    Surname: surname,
  });

  return addResult;
};

export const getProfilePhotoFileByUniqueId = async (uniqueId: string) => {
  return getImageFileForUniqueId(workforceSiteUrl, uniqueId);
};

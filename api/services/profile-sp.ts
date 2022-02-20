import { IFileAddResult, IItem } from "@pnp/sp-commonjs";
import { AddableProfile, Profile } from "../interfaces/profile";
import {
  AddableProfileListItem,
  PersistedProfileListItem,
} from "../interfaces/profile-sp";
import { PersistedUserPhotoListItem } from "../interfaces/photo-sp";
import { logTrace } from "../utilties/logging";
import { getWorkforcePortalConfig } from "./configuration-service";
import {
  addFileToFolder,
  applyToItemsByFilter,
  applyToPagedItemsdByFilter,
  createItem,
  deleteFileByUniqueId,
  deleteItem,
  getLibraryAsList,
  updateItem,
} from "./sp-service";

const workforcePortalConfig = getWorkforcePortalConfig();
const workforceSiteUrl = workforcePortalConfig.spSiteUrl;
const profilesListGuid = workforcePortalConfig.spProfilesListGuid;
const userPhotosServerRelativeUrl =
  workforcePortalConfig.spWorkforcePhotosServerRelativeUrl;
const userPhotosDocumentLibraryTitle =
  workforcePortalConfig.spWorkforcePhotosLibraryTitle;

export const getProfileByProfileId = async (
  profileId: string
): Promise<Profile | null> => {
  const profiles = await getProfilesByFilter(`ProfileId eq '${profileId}'`);
  if (profiles?.length) {
    return profiles[0];
  } else {
    return null;
  }
};

export const createProfileListItem = async (
  addableProfile: AddableProfile
): Promise<Profile> => {
  const addResult = await createItem<AddableProfileListItem>(
    workforceSiteUrl,
    profilesListGuid,
    addableProfileToListItem(addableProfile)
  );
  return listItemToProfile(addResult.data);
};

export const updateProfileListItem = async (
  profile: Profile
): Promise<Profile> => {
  const listItem = addableProfileToListItem(profile);
  await updateItem(workforceSiteUrl, profilesListGuid, profile.dbId, listItem);
  return profile;
};

export const getProfilesByFilter = async (
  filter?: string
): Promise<Profile[]> => {
  return applyToItemsByFilter<PersistedProfileListItem, Profile>(
    workforceSiteUrl,
    profilesListGuid,
    (items: PersistedProfileListItem[]) => {
      return Promise.resolve(items.map(listItemToProfile));
    },
    filter
  );
};

const listItemToPhotoIds = (
  item: PersistedProfileListItem
): Profile["photoIds"] => {
  const photoIdsText = item.PhotoIds;
  if (photoIdsText) {
    return photoIdsText.split("\n").map((id) => id.trim());
  } else {
    return [];
  }
};

const listItemToProfile = (item: PersistedProfileListItem): Profile => {
  return {
    profileId: item.ProfileId,
    email: item.Email,
    displayName: item.Title,
    givenName: item.GivenName,
    surname: item.Surname,
    telephone: item.Telephone,
    address: item.Address,
    photoIds: listItemToPhotoIds(item),
    dbId: item.ID,
    version: item.Version ?? 1,
  };
};

const addableProfileToListItem = (
  addableProfile: AddableProfile
): AddableProfileListItem => {
  return {
    ProfileId: addableProfile.profileId,
    Title: addableProfile.displayName,
    Email: addableProfile.email,
    GivenName: addableProfile.givenName,
    Surname: addableProfile.surname,
    Telephone: addableProfile.telephone,
    Address: addableProfile.address,
    PhotoIds: addableProfile.photoIds.join("\n"),
    Version: addableProfile.version,
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

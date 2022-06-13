import { AddableProfile, Profile } from "../interfaces/profile";
import {
  AddableProfileListItem,
  PersistedProfileListItem,
} from "../interfaces/profile-sp";
import { getWorkforcePortalConfig } from "./configuration-service";
import {
  applyToItemsByFilter,
  createItem,
  deleteItem,
  updateItem,
} from "./sp-service";

const workforcePortalConfig = getWorkforcePortalConfig();
const workforceSiteUrl = workforcePortalConfig.spSiteUrl;
const profilesListGuid = workforcePortalConfig.spProfilesListGuid;

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

export const deleteProfileListItem = async (
  profile: Profile
): Promise<void> => {
  await deleteItem(workforceSiteUrl, profilesListGuid, profile.dbId);
};

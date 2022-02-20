import { UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { v4 as uuidv4 } from "uuid";
import { FileContentWithInfo } from "../interfaces/file";
import {
  AddableProfile,
  Profile,
  ProfileWithCurrentApplication,
  UpdatableProfile,
} from "../interfaces/profile";
import { ACCEPTED_IMAGE_EXTENSIONS } from "../interfaces/sp-files";
import { UserLogin } from "../interfaces/user-login";
import { logTrace } from "../utilties/logging";
import {
  getApplicationByProfile,
  updateApplicationFromProfileIfNeeded,
} from "./application-service";
import { getWorkforcePortalConfig } from "./configuration-service";
import {
  addProfilePhotoFileWithItem,
  deletePhotoByUniqueId,
  getProfilePhotoFileByUniqueId,
} from "./photos-sp";
import {
  createProfileListItem,
  getProfileByProfileId,
  updateProfileListItem,
} from "./profile-sp";
import { createUserLogin, getUserLogin } from "./user-service";

const workforcePortalConfig = getWorkforcePortalConfig();
const maxPhotosPerPerson = workforcePortalConfig.maxProfilePhotosPerPerson;

const PROFILE_SERVICE_ERROR_TYPE_VAL =
  "profile-service-error-b2facf8d-038c-449b-8e24-d6cfe6680bd4";

type ProfileServiceErrorType = "version-conflict" | "missing-user-profile";

export class ProfileServiceError {
  private type: typeof PROFILE_SERVICE_ERROR_TYPE_VAL =
    PROFILE_SERVICE_ERROR_TYPE_VAL;
  public error: ProfileServiceErrorType;
  public arg1: any | null;

  constructor(error: ProfileServiceErrorType, arg1?: any) {
    this.error = error;
    this.arg1 = arg1 ?? null;
  }
}

export function isProfileServiceError(obj: any): obj is ProfileServiceError {
  return obj?.type === PROFILE_SERVICE_ERROR_TYPE_VAL;
}

export const getProfileForAuthenticatedUser = async (
  userInfo: UserInfo
): Promise<ProfileWithCurrentApplication> => {
  const userLogin = await getUserLogin(userInfo);

  if (!userLogin) {
    const profileId = uuidv4();
    logTrace(
      "getProfileForAuthenticatedUser: User login does not exist. Creating new user login and profile. Profile ID: " +
        profileId
    );

    const createdUserLogin: UserLogin = await createUserLogin(
      userInfo,
      profileId
    );

    // Populate basic profile fields from the user login. Users can update these later.
    const newProfile: AddableProfile = {
      profileId,
      displayName: createdUserLogin.displayName,
      givenName: createdUserLogin.givenName,
      surname: createdUserLogin.surname,
      email: createdUserLogin.email,
      photoIds: [],
      version: 1,
    };

    logTrace(
      "getProfileForAuthenticatedUser: About to create profile: " +
        JSON.stringify(newProfile)
    );
    return {
      profile: await createProfileListItem(newProfile),
    };
  } else {
    const profileId = userLogin.profileId;
    const profile = await getProfileByProfileId(profileId);
    if (!profile) {
      throw new ProfileServiceError("missing-user-profile");
    }

    const existingApplication = await getApplicationByProfile(profile);
    if (existingApplication) {
      const updateApplication = await updateApplicationFromProfileIfNeeded(
        existingApplication,
        profile
      );

      return {
        profile,
        application: updateApplication,
      };
    } else {
      return { profile };
    }
  }
};

export const updateUserProfile = async (
  updatableProfile: UpdatableProfile,
  userInfo: UserInfo
): Promise<ProfileWithCurrentApplication> => {
  // Retrieve the existing user profile
  const existingProfileAndApplication = await getProfileForAuthenticatedUser(
    userInfo
  );
  const existingProfile = existingProfileAndApplication?.profile;

  if (existingProfile) {
    // Update the user's profile if the version numbers match.
    if (existingProfile.version === updatableProfile.version) {
      const updatedProfile: Profile = {
        ...existingProfile,
        ...updatableProfile,
        version: existingProfile.version + 1,
      };

      const updatedUserProfile = await updateProfileListItem(updatedProfile);

      const existingApplication = existingProfileAndApplication?.application;
      if (existingApplication) {
        const updateApplication = await updateApplicationFromProfileIfNeeded(
          existingApplication,
          updatedUserProfile
        );

        return {
          profile: updatedUserProfile,
          application: updateApplication,
        };
      } else {
        return {
          profile: updatedUserProfile,
        };
      }
    } else {
      // The profile being saved has a different version number to the existing profile. The user may
      // have saved the profile from another device.
      throw new ProfileServiceError("version-conflict", existingProfile);
    }
  } else {
    throw new ProfileServiceError("missing-user-profile");
  }
};

export const getProfilePicture = async (
  encodedPhotoId: string
): Promise<FileContentWithInfo | null> => {
  const [uniqueId] = encodedPhotoId.split(":");
  const getPhotoResult = await getProfilePhotoFileByUniqueId(uniqueId);
  if (!getPhotoResult) {
    return null;
  }

  const [filename, content, extension, mimeType] = getPhotoResult;
  return {
    filename,
    content,
    extension,
    mimeType,
  };
};

export const deleteProfilePicture = async (
  userInfo: UserInfo
): Promise<ProfileWithCurrentApplication> => {
  const userProfileAndApplication = await getProfileForAuthenticatedUser(
    userInfo
  );

  if (userProfileAndApplication) {
    logTrace("deleteProfilePicture: Retrieved existing user profile");
    const userProfile = userProfileAndApplication.profile;

    const photoIds = userProfile.photoIds;
    if (photoIds.length > 0) {
      const encodedDeletePhotoId = photoIds[0];
      const [uniqueId] = encodedDeletePhotoId.split(":");
      logTrace("deleteProfilePicture: Deleting photo: " + uniqueId);
      deletePhotoByUniqueId(uniqueId);

      const remainingPhotoIds = photoIds.slice(1);

      // Update the user profile to reflect the new photo id.
      const updatedProfile: Profile = {
        ...userProfile,
        photoIds: remainingPhotoIds,
        version: userProfile.version + 1,
      };

      const updatedUserProfile = await updateProfileListItem(updatedProfile);
      logTrace("deleteProfilePicture: User profile updated.");

      return {
        profile: updatedUserProfile,
        application: userProfileAndApplication.application,
      };
    } else {
      return userProfileAndApplication;
    }
  } else {
    throw new ProfileServiceError("missing-user-profile");
  }
};

export const setProfilePicture = async (
  userInfo: UserInfo,
  fileExtension: ACCEPTED_IMAGE_EXTENSIONS,
  fileBuffer: Buffer
): Promise<ProfileWithCurrentApplication> => {
  const userProfileAndApplication = await getProfileForAuthenticatedUser(
    userInfo
  );

  if (userProfileAndApplication) {
    logTrace("setProfilePicture: Retrieved existing user profile");
    const userProfile = userProfileAndApplication.profile;

    logTrace(
      "setProfilePicture: Number of photos that already exist for user: " +
        userProfile.photoIds.length
    );

    const photoId = uuidv4();
    const strippedFileName = userProfile.displayName + " - " + photoId;

    logTrace(
      "setProfilePicture: Adding photo file with stripped filename: " +
        strippedFileName
    );
    const fileAddResult = await addProfilePhotoFileWithItem(
      strippedFileName,
      fileExtension,
      fileBuffer,
      userProfile.profileId,
      userProfile.givenName ?? "",
      userProfile.surname ?? "",
      photoId
    );

    logTrace(
      "setProfilePicture: File added. UniqueId: " +
        fileAddResult.data.UniqueId +
        ". Name: " +
        fileAddResult.data.Name
    );

    const encodedPhotoId = fileAddResult.data.UniqueId + ":" + photoId;
    const allPhotoIds = [encodedPhotoId, ...userProfile.photoIds];

    const keepPhotoIds = allPhotoIds.slice(0, maxPhotosPerPerson);
    const deletePhotoIds = allPhotoIds.slice(maxPhotosPerPerson);

    // Delete any unused photos. No need to wait for this operation to complete as if it fails then
    // we end up with a few unused files in the document library which can be cleaned by some other process.
    deletePhotoIds.forEach((encodedDeletePhotoId) => {
      const [uniqueId] = encodedDeletePhotoId.split(":");
      logTrace("setProfilePicture: Deleting photo: " + uniqueId);
      deletePhotoByUniqueId(uniqueId);
    });

    // Update the user profile to reflect the new photo id.
    const updatedProfile: Profile = {
      ...userProfile,
      photoIds: keepPhotoIds,
      version: userProfile.version + 1,
    };

    const updatedUserProfile = await updateProfileListItem(updatedProfile);
    logTrace("setProfilePicture: User profile updated.");

    const existingApplication = userProfileAndApplication?.application;
    if (existingApplication) {
      logTrace(
        "setProfilePicture: Updating user's application is reponse to the profile change"
      );
      const updateApplication = await updateApplicationFromProfileIfNeeded(
        existingApplication,
        updatedUserProfile
      );
      logTrace("setProfilePicture: Application updated");

      return {
        profile: updatedUserProfile,
        application: updateApplication,
      };
    } else {
      return {
        profile: updatedUserProfile,
      };
    }
  } else {
    throw new ProfileServiceError("missing-user-profile");
  }
};

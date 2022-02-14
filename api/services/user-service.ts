import { UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { v4 as uuidv4 } from "uuid";
import { FileContentWithInfo } from "../interfaces/file";
import { ACCEPTED_IMAGE_EXTENSIONS } from "../interfaces/sp-files";
import {
  AddableUserLogin,
  UpdatableUserLogin,
  UserLogin,
  UserLoginWithCurrentApplication,
} from "../interfaces/user-login";
import { logError, logTrace } from "../utilties/logging";
import {
  getApplication,
  updateApplicationFromProfile,
} from "./application-service";
import { getWorkforcePortalConfig } from "./configuration-service";
import { getGraphUser } from "./users-graph";
import {
  addProfilePhotoFileWithItem,
  createUserListItem,
  deletePhotoByUniqueId,
  deleteProfilePhotoFile,
  getProfilePhotoFileByUniqueId,
  getUserLogin,
  updateUserListItem,
} from "./users-sp";

const workforcePortalConfig = getWorkforcePortalConfig();
const maxPhotosPerPerson = workforcePortalConfig.maxProfilePhotosPerPerson;

const USER_SERVICE_ERROR_TYPE_VAL =
  "user-service-error-d992f06a-75df-478c-a169-ec4024b48092";

type UserServiceErrorType =
  | "unauthenticated"
  | "version-conflict"
  | "missing-user-profile";

export class UserServiceError {
  private type: typeof USER_SERVICE_ERROR_TYPE_VAL =
    USER_SERVICE_ERROR_TYPE_VAL;
  public error: UserServiceErrorType;
  public arg1: any | null;

  constructor(error: UserServiceErrorType, arg1?: any) {
    this.error = error;
    this.arg1 = arg1 ?? null;
  }
}

export function isUserServiceError(obj: any): obj is UserServiceError {
  return obj?.type === USER_SERVICE_ERROR_TYPE_VAL;
}

const getUserProfilePropertiesFromGraph = async (
  userInfo: UserInfo
): Promise<AddableUserLogin | null> => {
  if (!userInfo || !userInfo.userId) {
    throw new UserServiceError("unauthenticated");
  }

  const graphUser = await getGraphUser(userInfo.userId);
  console.log(
    "getUserProfilePropertiesFromGraph: GraphUser: " +
      JSON.stringify(graphUser, null, 2)
  );

  if (graphUser && graphUser.identityProvider) {
    const userLoginFromGraph: AddableUserLogin = {
      displayName: graphUser.displayName ?? "unknown",
      identityProviderUserId: userInfo.userId,
      identityProviderUserDetails: userInfo.userDetails ?? "unknown",
      givenName: graphUser.givenName,
      surname: graphUser.surname,
      email: graphUser.email,
      identityProvider: graphUser.identityProvider,
      photoIds: [],
      version: 1,
    };
    return userLoginFromGraph;
  } else {
    return null;
  }
};

export const getUserProfile = async (
  userInfo: UserInfo
): Promise<UserLoginWithCurrentApplication | null> => {
  if (!userInfo || !userInfo.userId) {
    throw new UserServiceError("unauthenticated");
  }

  const userLogin = await getUserLogin(userInfo.userId);
  if (userLogin) {
    const existingApplication = await getApplication(userInfo);

    // Check and populate any missing mandatory properties on the user profile.
    if (!userLogin.identityProvider || !userLogin.identityProviderUserDetails) {
      const graphUser = await getUserProfilePropertiesFromGraph(userInfo);
      if (graphUser && graphUser.identityProvider) {
        const updatingUserLogin: UserLogin = {
          ...userLogin,
        };

        if (!userLogin.identityProvider) {
          updatingUserLogin.identityProvider = graphUser.identityProvider;
        }

        if (!userLogin.identityProviderUserDetails) {
          updatingUserLogin.identityProviderUserDetails =
            graphUser.identityProviderUserDetails;
        }

        const updatedUserLogin = await updateUserListItem(updatingUserLogin);
        if (existingApplication) {
          const updateApplication = await updateApplicationFromProfile(
            existingApplication,
            updatedUserLogin
          );

          return {
            profile: updatedUserLogin,
            application: updateApplication,
          };
        } else {
          return {
            profile: updatedUserLogin,
          };
        }
      }
    }

    return {
      profile: userLogin,
      application: existingApplication ?? undefined,
    };
  } else {
    logTrace(
      "getUserProfile: User profile does not exist. Creating based on data from Graph API."
    );
    const graphUser = await getUserProfilePropertiesFromGraph(userInfo);
    if (graphUser && graphUser.identityProvider) {
      const newUserLogin: AddableUserLogin = {
        displayName: graphUser.displayName ?? "unknown",
        identityProviderUserId: userInfo.userId,
        identityProviderUserDetails: userInfo.userDetails ?? "unknown",
        givenName: graphUser.givenName,
        surname: graphUser.surname,
        email: graphUser.email,
        identityProvider: graphUser.identityProvider,
        photoIds: [],
        version: 1,
      };

      logTrace(
        "getUserProfile: About to create user profile: " +
          JSON.stringify(newUserLogin)
      );
      return {
        profile: await createUserListItem(newUserLogin),
      };
    } else {
      logError(
        "getUserProfile: Could not read information for user from Graph API. Profile not created."
      );
      return null;
    }
  }
};

export const updateUserProfile = async (
  updatableProfile: UpdatableUserLogin,
  userInfo: UserInfo
): Promise<UserLoginWithCurrentApplication> => {
  // Retrieve the existing user profile
  const existingProfileAndApplication = await getUserProfile(userInfo);
  const existingProfile = existingProfileAndApplication?.profile;

  if (existingProfile) {
    // Update the user's profile if the version numbers match.
    if (existingProfile.version === updatableProfile.version) {
      const updatedProfile: UserLogin = {
        ...existingProfile,
        ...updatableProfile,
        version: existingProfile.version + 1,
      };

      const updatedUserProfile = await updateUserListItem(updatedProfile);

      const existingApplication = existingProfileAndApplication?.application;
      if (existingApplication) {
        const updateApplication = await updateApplicationFromProfile(
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
      // The profile being saved has a different version number to the existing application. The user may
      // have saved the profile from another device.
      throw new UserServiceError("version-conflict", existingProfile);
    }
  } else {
    throw new UserServiceError("missing-user-profile");
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
): Promise<boolean> => {
  if (!userInfo || !userInfo.userId) {
    throw new UserServiceError("unauthenticated");
  }

  return deleteProfilePhotoFile(userInfo.userId);
};

export const setProfilePicture = async (
  userInfo: UserInfo,
  fileExtension: ACCEPTED_IMAGE_EXTENSIONS,
  fileBuffer: Buffer
): Promise<UserLoginWithCurrentApplication> => {
  if (!userInfo || !userInfo.userId) {
    throw new UserServiceError("unauthenticated");
  }

  const userProfileAndApplication = await getUserProfile(userInfo);

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
      userProfile.identityProviderUserId,
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
    const updatedProfile: UserLogin = {
      ...userProfile,
      photoIds: keepPhotoIds,
      version: userProfile.version + 1,
    };

    const updatedUserProfile = await updateUserListItem(updatedProfile);
    logTrace("setProfilePicture: User profile updated.");

    const existingApplication = userProfileAndApplication?.application;
    if (existingApplication) {
      logTrace(
        "setProfilePicture: Updating user's application is reponse to the profile change"
      );
      const updateApplication = await updateApplicationFromProfile(
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
    // } else {
    // return userProfileAndApplication;
    // }
  } else {
    throw new UserServiceError("missing-user-profile");
  }
};

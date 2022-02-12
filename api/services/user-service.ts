import { UserInfo } from "@aaronpowell/static-web-apps-api-auth";
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
import { getGraphUser } from "./users-graph";
import {
  addProfilePhotoFileWithItem,
  createUserListItem,
  deleteProfilePhotoFile,
  getProfilePhotoFile,
  getUserLogin,
  updateUserListItem,
} from "./users-sp";

const USER_SERVICE_ERROR_TYPE_VAL =
  "user-service-error-d992f06a-75df-478c-a169-ec4024b48092";

type UserServiceErrorType =
  | "unauthenticated"
  | "version-conflict"
  | "missing-user-profile"
  | "profile-photo-already-exists";

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
      photoRequired: true,
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
        photoRequired: true,
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
  userInfo: UserInfo,
  index: number = 0
): Promise<FileContentWithInfo | null> => {
  if (!userInfo || !userInfo.userId) {
    throw new UserServiceError("unauthenticated");
  }

  const getPhotoResult = await getProfilePhotoFile(userInfo.userId, index);
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

    const strippedFileName =
      userProfile.displayName + " - " + userProfile.identityProviderUserId;

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
      userProfile.surname ?? ""
    );

    if (fileAddResult === "COULD_NOT_DETERMINE_NEW_FILENAME") {
      logError(
        "setProfilePicture: Error adding file. Couldn't find available filename."
      );
      throw new UserServiceError("profile-photo-already-exists");
    } else {
      logTrace("setProfilePicture: File added");

      // Clear the photo required flag if present.
      if (userProfile.photoRequired) {
        logTrace(
          "setProfilePicture: User profile currently flagged as photoRequired. Clearing flag"
        );
        const updatedProfile: UserLogin = {
          ...userProfile,
          photoRequired: false,
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
      } else {
        return userProfileAndApplication;
      }
    }
  } else {
    throw new UserServiceError("missing-user-profile");
  }
};

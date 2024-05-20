import { Effect, Either, Option, Layer } from "effect";
import { Schema as S } from "@effect/schema";
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
  getApplicationByProfileAndUpdateIfNeeded,
  updateApplicationFromProfileIfNeeded,
} from "./application-service";
import { getWorkforcePortalConfig } from "./configuration-service";
import { clearProfileIdForPhoto } from "./photo-service";
import {
  addProfilePhotoFileWithItem,
  deletePhotoByUniqueId,
  getProfilePhotoFileByUniqueId,
} from "./photos-sp";
import {
  createProfileListItem,
  deleteProfileListItem,
  getProfileByProfileId,
  updateProfileListItem,
} from "./profile-sp";
import {
  createUserLogin,
  createUserLoginForGraphUser,
  deleteUserLoginsByProfileId,
  getUserLogin,
} from "./user-service";
import { defaultGraphClient } from "../graph/default-graph-client";
import { userLoginRepositoryLive } from "../model/user-logins-repository-graph";
import { applicationsRepositoryLive } from "../model/applications-repository-graph";
import { graphListAccessesLive } from "../contexts/graph-list-access-live";
import {
  ModelAddableProfile,
  ModelPersistedProfile,
  ModelProfileId,
} from "../model/interfaces/profile";
import { ModelPersistedUserLogin } from "../model/interfaces/user-login";
import { ProfilesRepository } from "../model/profiles-repository";
import { ModelPersistedApplication } from "../model/interfaces/application";

const workforcePortalConfig = getWorkforcePortalConfig();
const maxPhotosPerPerson = workforcePortalConfig.maxProfilePhotosPerPerson;

const PROFILE_SERVICE_ERROR_TYPE_VAL =
  "profile-service-error-b2facf8d-038c-449b-8e24-d6cfe6680bd4";

type ProfileServiceErrorType = "version-conflict" | "missing-user-profile";

export class ProfileServiceError {
  private type: typeof PROFILE_SERVICE_ERROR_TYPE_VAL =
    PROFILE_SERVICE_ERROR_TYPE_VAL;
  public error: ProfileServiceErrorType;
  public arg1: unknown | null;

  constructor(error: ProfileServiceErrorType, arg1?: unknown) {
    this.error = error;
    this.arg1 = arg1 ?? null;
  }
}

export function isProfileServiceError(
  obj: unknown
): obj is ProfileServiceError {
  return (
    !!obj &&
    typeof obj === "object" &&
    "type" in obj &&
    obj.type === PROFILE_SERVICE_ERROR_TYPE_VAL
  );
}

const getNewProfileId = () => S.decodeSync(ModelProfileId)(uuidv4());

const getNewProfileDataForUserLogin =
  (profileId: ModelProfileId) =>
  (createdUserLogin: ModelPersistedUserLogin): ModelAddableProfile => ({
    profileId,
    displayName: createdUserLogin.displayName,
    givenName: createdUserLogin.givenName,
    surname: createdUserLogin.surname,
    email: createdUserLogin.email,
    photoIds: [],
    version: 1,
  });

const createNewUserLoginAndProfileForGraphUser = (graphUserId: string) => {
  const profileId = getNewProfileId();
  logTrace(
    "getProfileForAuthenticatedUser: User login does not exist. Creating new user login and profile. Profile ID: " +
      profileId
  );

  return createUserLoginForGraphUser(graphUserId, profileId).pipe(
    Effect.andThen(getNewProfileDataForUserLogin(profileId)),
    Effect.andThen((addedProfile) =>
      ProfilesRepository.pipe(
        Effect.andThen((repository) =>
          repository.modelCreateProfile(addedProfile)
        )
      )
    )
  );
};

type ProfileWithOptionalApplication = {
  profile: ModelPersistedProfile;
  application: Option.Option<ModelPersistedApplication>;
};

const getProfileWithApplication = (profileId: ModelProfileId) => {
  return ProfilesRepository.pipe(
    Effect.andThen((repository) =>
      repository.modelGetProfileByProfileId(profileId)
    ),
    Effect.andThen((profile) =>
      getApplicationByProfileAndUpdateIfNeeded(profile).pipe(
        Effect.andThen((application) =>
          Effect.succeed({
            profile,
            application: Option.some(application),
          } as ProfileWithOptionalApplication)
        ),
        Effect.catchTag("ApplicationNotFound", () =>
          Effect.succeed({
            profile,
            application: Option.none(),
          } as ProfileWithOptionalApplication)
        )
      )
    )
  );
};

export const getProfileForAuthenticatedUserEffect = (userId: string) =>
  getUserLogin(userId).pipe(
    Effect.andThen((userLogin) =>
      getProfileWithApplication(userLogin.profileId)
    )
  );

export const getOrCreateProfileForAuthenticatedUserEffect = (
  userId: string
) => {
  return getProfileForAuthenticatedUserEffect(userId).pipe(
    Effect.catchTag("UnknownUser", () =>
      createNewUserLoginAndProfileForGraphUser(userId).pipe(
        Effect.andThen((profile) =>
          Effect.succeed({
            profile,
            application: Option.none(),
          } as ProfileWithOptionalApplication)
        )
      )
    )
  );
};

export const getOrCreateProfileForAuthenticatedUser = async (
  userId: string
): Promise<ProfileWithCurrentApplication> => {
  const repositoriesLayer = Layer.merge(
    userLoginRepositoryLive,
    applicationsRepositoryLive
  );

  const layers = repositoriesLayer.pipe(
    Layer.provide(graphListAccessesLive),
    Layer.provide(defaultGraphClient)
  );

  const userLoginEffect = getUserLogin(userId).pipe(Effect.either);
  const runnableGetUserLogin = Effect.provide(userLoginEffect, layers);

  const userLoginEither = await Effect.runPromise(runnableGetUserLogin);

  if (Either.isLeft(userLoginEither)) {
    const profileId = uuidv4();
    logTrace(
      "getProfileForAuthenticatedUser: User login does not exist. Creating new user login and profile. Profile ID: " +
        profileId
    );

    const createdUserLogin: UserLogin = await createUserLogin(
      userId,
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
    const userLogin = userLoginEither.right;
    const profileId = userLogin.profileId;
    const profile = await getProfileByProfileId(profileId);
    if (!profile) {
      throw new ProfileServiceError("missing-user-profile");
    }

    const existingApplicationEffect = getApplicationByProfile(profile).pipe(
      Effect.match({
        onSuccess: (application) => application,
        onFailure: () => null,
      })
    );

    const runnable = Effect.provide(existingApplicationEffect, layers);

    const existingApplication = await Effect.runPromise(runnable);

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
  userId: string
): Promise<ProfileWithCurrentApplication> => {
  // Retrieve the existing user profile
  const existingProfileAndApplication =
    await getOrCreateProfileForAuthenticatedUser(userId);
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

const deleteAllPicturesForProfile = async (profile: Profile): Promise<void> => {
  const photoIds = profile.photoIds;

  const deletePhotoPromises = photoIds.map((encodedPhotoId) => {
    const [uniqueId] = encodedPhotoId.split(":");
    logTrace(
      "deleteAllPicturesForProfile: Clearing Profile ID on photo: " + uniqueId
    );
    return clearProfileIdForPhoto(uniqueId);
  });

  await Promise.all(deletePhotoPromises);

  logTrace(
    "deleteAllPicturesForProfile: Photos deleted and user profile updated."
  );
};

export const deleteUserProfile = async (profile: Profile) => {
  await deleteAllPicturesForProfile(profile);
  await deleteUserLoginsByProfileId(profile.profileId);
  await deleteProfileListItem(profile);
};

export const deleteProfilePicture = async (
  userId: string
): Promise<ProfileWithCurrentApplication> => {
  const userProfileAndApplication =
    await getOrCreateProfileForAuthenticatedUser(userId);

  if (userProfileAndApplication) {
    logTrace("deleteProfilePicture: Retrieved existing user profile");
    const userProfile = userProfileAndApplication.profile;

    const photoIds = userProfile.photoIds;
    if (photoIds.length > 0) {
      const encodedDeletePhotoId = photoIds[0];
      const [uniqueId] = encodedDeletePhotoId.split(":");
      logTrace(
        "deleteProfilePicture: Clearing Profile ID on photo: " + uniqueId
      );
      const clearPhotoPromise = clearProfileIdForPhoto(uniqueId);

      const remainingPhotoIds = photoIds.slice(1);

      // Update the user profile to reflect the new photo id.
      const updatedProfile: Profile = {
        ...userProfile,
        photoIds: remainingPhotoIds,
        version: userProfile.version + 1,
      };

      const updateProfilePromise = updateProfileListItem(updatedProfile);
      await Promise.all([clearPhotoPromise, updateProfilePromise]);

      const updatedUserProfile = await updateProfilePromise;
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
  userId: string,
  fileExtension: ACCEPTED_IMAGE_EXTENSIONS,
  fileBuffer: Buffer
): Promise<ProfileWithCurrentApplication> => {
  const userProfileAndApplication =
    await getOrCreateProfileForAuthenticatedUser(userId);

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

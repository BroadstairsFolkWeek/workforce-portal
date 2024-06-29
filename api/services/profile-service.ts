import { Effect, Option, Layer } from "effect";
import { Schema as S } from "@effect/schema";
import { v4 as uuidv4 } from "uuid";
import {
  Profile,
  ProfileWithCurrentApplication,
  UpdatableProfile,
} from "../interfaces/profile";
import { logTrace } from "../utilties/logging";
import {
  getApplicationByProfile,
  getApplicationByProfileAndUpdateIfNeeded,
  updateApplicationFromProfileIfNeededEffect,
} from "./application-service";
import { photoIdFromEncodedPhotoId } from "./photo-service";
import { deleteProfileListItem } from "./profile-sp";
import {
  createUserLoginEffect,
  createUserLoginForGraphUser,
  deleteUserLoginsByProfileId,
} from "./user-service";
import { defaultGraphClient } from "../graph/default-graph-client";
import { userLoginRepositoryLive } from "../model/user-logins-repository-graph";
import { applicationsRepositoryLive } from "../model/applications-repository-graph";
import { graphListAccessesLive } from "../contexts/graph-list-access-live";
import {
  ModelAddableProfile,
  ModelProfile,
  ModelProfileId,
} from "../model/interfaces/profile";
import { ModelPersistedUserLogin } from "../model/interfaces/user-login";
import { ProfilesRepository } from "../model/profiles-repository";
import { ModelPersistedApplication } from "../model/interfaces/application";
import { PhotosRepository } from "../model/photos-repository";
import { profilesRepositoryLive } from "../model/profiles-repository-live";
import { wfApiClientLive } from "../wf-api/wf-client-live";
import { graphUsersRepositoryLive } from "../model/graph-users-repository-graph";

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
  profile: ModelProfile;
  application: Option.Option<ModelPersistedApplication>;
};

const getProfileByUserId = (userId: string) =>
  ProfilesRepository.pipe(
    Effect.andThen((repository) => repository.modelGetProfileByUserId(userId))
  );

const getProfileWithApplicationByUserId = (userId: string) => {
  return getProfileByUserId(userId).pipe(
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
  getProfileWithApplicationByUserId(userId);

export const getOrCreateProfileForAuthenticatedUserEffect = (
  userId: string
) => {
  return getProfileForAuthenticatedUserEffect(userId).pipe(
    Effect.catchTag("ProfileNotFound", () =>
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

const createUserLoginAndProfile = (userId: string) => {
  const profileId = ModelProfileId.make(uuidv4());
  logTrace(
    "getProfileForAuthenticatedUser: User login does not exist. Creating new user login and profile. Profile ID: " +
      profileId
  );

  return createUserLoginEffect(userId, profileId).pipe(
    Effect.andThen((createdUserLogin) =>
      ProfilesRepository.pipe(
        Effect.andThen((profilesRepository) =>
          profilesRepository.modelCreateProfile({
            profileId,
            displayName: createdUserLogin.displayName,
            givenName: createdUserLogin.givenName,
            surname: createdUserLogin.surname,
            email: createdUserLogin.email,
            photoIds: [],
            version: 1,
          })
        )
      )
    ),
    Effect.andThen(
      (persistedProfile) =>
        ({
          ...persistedProfile,
          photoUrl: "",
        } as ModelProfile)
    )
  );
};

export const getOrCreateProfileForAuthenticatedUser = async (
  userId: string
): Promise<ProfileWithCurrentApplication> => {
  const repositoriesLayer = Layer.mergeAll(
    userLoginRepositoryLive,
    applicationsRepositoryLive,
    profilesRepositoryLive,
    graphUsersRepositoryLive
  );

  const layers = repositoriesLayer.pipe(
    Layer.provide(graphListAccessesLive),
    Layer.provide(defaultGraphClient),
    Layer.provide(wfApiClientLive)
  );

  const getAndUpdateExistingApplicationProgram = ProfilesRepository.pipe(
    Effect.andThen((profilesRepository) =>
      profilesRepository.modelGetProfileByUserId(userId)
    ),
    Effect.andThen((profile) =>
      getApplicationByProfile(profile).pipe(
        Effect.andThen(updateApplicationFromProfileIfNeededEffect(profile)),
        Effect.andThen((application) =>
          Effect.succeed({ profile, application })
        ),
        Effect.catchTag("ApplicationNotFound", () =>
          Effect.succeed({ profile })
        )
      )
    )
  ).pipe(
    Effect.catchTag("ProfileNotFound", () =>
      createUserLoginAndProfile(userId).pipe(
        Effect.andThen((profile) => ({ profile }))
      )
    )
  );

  const runnable = Effect.provide(
    getAndUpdateExistingApplicationProgram,
    layers
  );

  return await Effect.runPromise(runnable);
};

interface ProfileUpdates
  extends Readonly<Omit<UpdatableProfile, "version" | "displayName">> {
  displayName?: string | undefined;
}

export const updateUserProfileEffect = (
  updatableProfile: ProfileUpdates,
  userId: string,
  version: number
) =>
  ProfilesRepository.pipe(
    Effect.andThen((profilesRepository) =>
      profilesRepository.modelUpdateProfileByUserId(
        userId,
        version,
        updatableProfile
      )
    )
  );

export const getProfilePicture = (encodedPhotoId: string) =>
  PhotosRepository.pipe(
    Effect.andThen((photoRepository) =>
      photoRepository.modelGetPhotoContentByPhotoId(
        photoIdFromEncodedPhotoId(encodedPhotoId)
      )
    )
  );

export const deleteUserProfile = async (profile: Profile) => {
  await deleteUserLoginsByProfileId(profile.profileId);
  await deleteProfileListItem(profile);
};

export const setProfilePicture = (
  userId: string,
  fileMimeType: string,
  fileBuffer: Buffer
) =>
  ProfilesRepository.pipe(
    Effect.andThen((profilesRepo) =>
      profilesRepo.modelSetProfilePhoto(userId, fileMimeType, fileBuffer)
    )
  );

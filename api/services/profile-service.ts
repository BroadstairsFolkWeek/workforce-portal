import { Effect, Option, Layer } from "effect";
import {
  ProfileWithCurrentApplication,
  UpdatableProfile,
} from "../interfaces/profile";
import {
  getApplicationByProfile,
  getApplicationByProfileAndUpdateIfNeeded,
  updateApplicationFromProfileIfNeededEffect,
} from "./application-service";
import { photoIdFromEncodedPhotoId } from "./photo-service";
import { getUserLoginPropertiesFromGraph } from "./user-service";
import { defaultGraphClient } from "../graph/default-graph-client";
import { applicationsRepositoryLive } from "../model/applications-repository-graph";
import { graphListAccessesLive } from "../contexts/graph-list-access-live";
import { ModelProfile } from "../model/interfaces/profile";
import { ProfilesRepository } from "../model/profiles-repository";
import { ModelPersistedApplication } from "../model/interfaces/application";
import { PhotosRepository } from "../model/photos-repository";
import { profilesRepositoryLive } from "../model/profiles-repository-live";
import { wfApiClientLive } from "../wf-api/wf-client-live";
import { graphUsersRepositoryLive } from "../model/graph-users-repository-graph";
import { FormSubmissionWithSpecAndActions } from "../model/interfaces/form";
import { getFormsByUserId } from "./forms-service";

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

const createNewUserLoginAndProfileForGraphUser = (graphUserId: string) => {
  return Effect.logDebug(
    `Creating a new user login and profile for ${graphUserId}`
  ).pipe(
    Effect.andThen(
      getUserLoginPropertiesFromGraph(graphUserId).pipe(
        Effect.andThen((userProps) =>
          ProfilesRepository.pipe(
            Effect.andThen((profilesRepository) =>
              profilesRepository.modelCreateProfileForUserLogin(userProps)
            )
          )
        )
      )
    )
  );
};

type ProfileWithOptionalApplication = {
  profile: ModelProfile;
  application: Option.Option<ModelPersistedApplication>;
  forms: FormSubmissionWithSpecAndActions[];
};

const getProfileByUserId = (userId: string) =>
  ProfilesRepository.pipe(
    Effect.andThen((repository) => repository.modelGetProfileByUserId(userId))
  );

export const getProfileWithFormsByProfile =
  (userId: string) => (profile: ModelProfile) =>
    getApplicationByProfileAndUpdateIfNeeded(profile)
      .pipe(
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
      .pipe(
        Effect.andThen((profileWithOptionalApplication) =>
          getFormsByUserId(userId).pipe(
            Effect.andThen((forms) =>
              Effect.succeed({
                ...profileWithOptionalApplication,
                forms,
              })
            )
          )
        )
      );

const getProfileWithApplicationByUserId = (userId: string) => {
  return getProfileByUserId(userId).pipe(
    Effect.andThen(getProfileWithFormsByProfile(userId))
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
            forms: [],
          } as ProfileWithOptionalApplication)
        )
      )
    )
  );
};

export const getOrCreateProfileForAuthenticatedUser = async (
  userId: string
): Promise<ProfileWithCurrentApplication> => {
  const repositoriesLayer = Layer.mergeAll(
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
      createNewUserLoginAndProfileForGraphUser(userId).pipe(
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
      profilesRepository
        .modelUpdateProfileByUserId(userId, version, updatableProfile)
        .pipe(
          Effect.andThen((profile) =>
            getFormsByUserId(userId).pipe(
              Effect.andThen((forms) =>
                Effect.succeed({
                  profile,
                  forms,
                })
              )
            )
          )
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

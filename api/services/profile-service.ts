import { Effect, Option, Layer } from "effect";
import {
  ProfileWithCurrentApplication,
  UpdatableProfile,
} from "../interfaces/profile";
import { photoIdFromEncodedPhotoId } from "./photo-service";
import { getUserLoginPropertiesFromGraph } from "./user-service";
import { defaultGraphClient } from "../graph/default-graph-client";
import { graphListAccessesLive } from "../contexts/graph-list-access-live";
import { ModelProfile } from "../model/interfaces/profile";
import { ProfilesRepository } from "../model/profiles-repository";
import { PhotosRepository } from "../model/photos-repository";
import { profilesRepositoryLive } from "../model/profiles-repository-live";
import { wfApiClientLive } from "../wf-api/wf-client-live";
import { graphUsersRepositoryLive } from "../model/graph-users-repository-graph";
import {
  FormSpec,
  FormSubmissionWithSpecAndActions,
} from "../model/interfaces/form";
import { getCreatableFormsByUserId, getFormsByUserId } from "./forms-service";

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

type ProfileWithForms = {
  profile: ModelProfile;
  forms: FormSubmissionWithSpecAndActions[];
  creatableForms: FormSpec[];
};

const getProfileByUserId = (userId: string) =>
  ProfilesRepository.pipe(
    Effect.andThen((repository) => repository.modelGetProfileByUserId(userId))
  );

export const getProfileWithFormsByProfile =
  (userId: string) => (profile: ModelProfile) =>
    getFormsByUserId(userId).pipe(
      Effect.andThen((forms) =>
        getCreatableFormsByUserId(userId).pipe(
          Effect.andThen((creatableForms) =>
            Effect.succeed({
              profile,
              forms,
              creatableForms,
            })
          )
        )
      )
    );

const getProfileWithFormsByUserId = (userId: string) => {
  return getProfileByUserId(userId).pipe(
    Effect.andThen(getProfileWithFormsByProfile(userId))
  );
};

export const getProfileForAuthenticatedUserEffect = (userId: string) =>
  getProfileWithFormsByUserId(userId);

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
            creatableForms: [],
          } as ProfileWithForms)
        )
      )
    )
  );
};

export const getOrCreateProfileForAuthenticatedUser = async (
  userId: string
): Promise<ProfileWithCurrentApplication> => {
  const repositoriesLayer = Layer.mergeAll(
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
    Effect.andThen((profile) => ({ profile }))
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
            Effect.all([
              getFormsByUserId(userId),
              getCreatableFormsByUserId(userId),
            ]).pipe(
              Effect.andThen(([forms, creatableForms]) =>
                Effect.succeed({
                  profile,
                  forms,
                  creatableForms,
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

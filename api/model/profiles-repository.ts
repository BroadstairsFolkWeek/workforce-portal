import { Effect, Context } from "effect";
import { ModelProfile, ModelProfileUpdates } from "./interfaces/profile";
import { ModelCoreUserLogin } from "./interfaces/user-login";

export class ProfileNotFound {
  readonly _tag = "ProfileNotFound";
}

export class ProfileVersionMismatch {
  readonly _tag = "ProfileVersionMismatch";
}

export class ProfilesRepository extends Context.Tag("ProfilesRepository")<
  ProfilesRepository,
  {
    readonly modelGetProfileByUserId: (
      userId: string
    ) => Effect.Effect<ModelProfile, ProfileNotFound>;

    readonly modelUpdateProfileByUserId: (
      userId: string,
      version: number,
      updates: ModelProfileUpdates
    ) => Effect.Effect<ModelProfile, ProfileNotFound | ProfileVersionMismatch>;

    readonly modelCreateProfileForUserLogin: (
      userLogin: ModelCoreUserLogin
    ) => Effect.Effect<ModelProfile>;

    readonly modelSetProfilePhoto: (
      userId: string,
      fileMimeType: string,
      fileBuffer: Buffer
    ) => Effect.Effect<ModelProfile>;

    readonly modelDeleteProfileByUserId: (
      userId: string
    ) => Effect.Effect<void>;
  }
>() {}

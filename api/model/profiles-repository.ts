import { Effect, Context } from "effect";
import {
  ModelAddableProfile,
  ModelPersistedProfile,
  ModelProfile,
  ModelProfileUpdates,
} from "./interfaces/profile";

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

    readonly modelCreateProfile: (
      addableProfile: ModelAddableProfile
    ) => Effect.Effect<ModelPersistedProfile>;

    readonly modelSetProfilePhoto: (
      userId: string,
      fileMimeType: string,
      fileBuffer: Buffer
    ) => Effect.Effect<ModelProfile>;
  }
>() {}

import { Effect, Context } from "effect";
import {
  ModelAddableProfile,
  ModelPersistedProfile,
  ModelProfile,
  ModelProfileId,
} from "./interfaces/profile";

export class ProfileNotFound {
  readonly _tag = "ProfileNotFound";
}

export class ProfilesRepository extends Context.Tag("ProfilesRepository")<
  ProfilesRepository,
  {
    readonly modelGetProfileByUserId: (
      userId: string
    ) => Effect.Effect<ModelProfile, ProfileNotFound>;
    readonly modelGetProfileByProfileId: (
      profileId: ModelProfileId
    ) => Effect.Effect<ModelPersistedProfile, ProfileNotFound>;
    readonly modelCreateProfile: (
      addableProfile: ModelAddableProfile
    ) => Effect.Effect<ModelPersistedProfile>;
  }
>() {}

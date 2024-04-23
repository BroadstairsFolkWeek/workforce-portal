import { Effect, Context } from "effect";
import {
  ModelApplicationChanges,
  ModelPersistedApplication,
} from "./interfaces/application";
import { RepositoryConflictError } from "./interfaces/repository-errors";

export class ApplicationNotFound {
  readonly _tag = "ApplicationNotFound";
}

export class ApplicationsRepository extends Context.Tag(
  "ApplicationsRepository"
)<
  ApplicationsRepository,
  {
    readonly modelGetApplicationByProfileId: (
      profileId: string
    ) => Effect.Effect<ModelPersistedApplication, ApplicationNotFound>;

    readonly modelGetApplicationByApplicationId: (
      profileId: string
    ) => Effect.Effect<ModelPersistedApplication, ApplicationNotFound>;

    readonly modelSaveApplicationChanges: (
      applicationId: string
    ) => (
      applyToVersion: number
    ) => (
      changes: ModelApplicationChanges
    ) => Effect.Effect<
      ModelPersistedApplication,
      ApplicationNotFound | RepositoryConflictError
    >;
  }
>() {}

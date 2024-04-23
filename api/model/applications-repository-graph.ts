import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";
import { GraphListAccess } from "./graph/graph-list-access";
import {
  ModelApplicationChanges,
  ModelApplicationChangesVersioned,
  ModelPersistedApplication,
} from "./interfaces/application";
import { RepositoryConflictError } from "./interfaces/repository-errors";
import {
  ApplicationNotFound,
  ApplicationsRepository,
} from "./applications-repository";

const listItemToApplication = (item: any) => {
  // Apply defaults for any missing fields.
  const itemWithDefaults = {
    ConsentNewlifeWills: false,
    NewlifeHaveWillInPlace: false,
    NewlifeHavePoaInPlace: false,
    NewlifeWantFreeReview: false,
    ...item,
  };

  return Schema.decode(ModelPersistedApplication)(itemWithDefaults);
};

const modelGetApplicationByFilter = (filter: string) => {
  return GraphListAccess.pipe(
    Effect.flatMap((listAccess) =>
      listAccess.getApplicationGraphListItemsByFilter(filter)
    ),
    Effect.head,
    Effect.catchTag("NoSuchElementException", () =>
      Effect.fail(new ApplicationNotFound())
    ),
    Effect.map((item) => item.fields),
    Effect.flatMap((fields) => listItemToApplication(fields)),
    // Parse errors of data from Graph/SharePoint are considered unrecoverable.
    Effect.catchTag("ParseError", (e) => Effect.die(e))
  );
};

const modelGetApplicationByProfileId = (profileId: string) => {
  return modelGetApplicationByFilter(`fields/ProfileId eq '${profileId}'`);
};

const modelGetApplicationByApplicationId = (applicationId: string) => {
  return modelGetApplicationByFilter(
    `fields/ApplicationId eq '${applicationId}'`
  );
};

const modelSaveApplicationChanges =
  (applicationId: string) =>
  (applyToVersion: number) =>
  (changes: ModelApplicationChanges) => {
    const dbIdAndConflictCheck = modelGetApplicationByApplicationId(
      applicationId
    ).pipe(
      Effect.flatMap((application) =>
        application.version === applyToVersion
          ? Effect.succeed(application)
          : Effect.fail(new RepositoryConflictError())
      ),
      Effect.map((application) => application.dbId)
    );

    const changedFields = Schema.encode(ModelApplicationChangesVersioned)({
      ...changes,
      version: applyToVersion + 1,
    });

    return Effect.all([
      dbIdAndConflictCheck,
      changedFields,
      GraphListAccess,
    ]).pipe(
      Effect.flatMap(([dbId, fields, listAccess]) =>
        listAccess.updateApplicationGraphListItemFields(dbId, fields)
      ),
      Effect.flatMap((fields) => listItemToApplication(fields)),
      // Parse errors of data from Graph/SharePoint are considered unrecoverable.
      Effect.catchTag("ParseError", (e) => Effect.die(e))
    );
  };

export const applicationsRepositoryLive = Layer.effect(
  ApplicationsRepository,
  GraphListAccess.pipe(
    Effect.map((service) => ({
      modelGetApplicationByProfileId: (profileId: string) =>
        modelGetApplicationByProfileId(profileId).pipe(
          Effect.provideService(GraphListAccess, service)
        ),

      modelGetApplicationByApplicationId: (applicationId: string) =>
        modelGetApplicationByApplicationId(applicationId).pipe(
          Effect.provideService(GraphListAccess, service)
        ),

      modelSaveApplicationChanges:
        (applicationId: string) =>
        (applyToVersion: number) =>
        (changes: ModelApplicationChanges) =>
          modelSaveApplicationChanges(applicationId)(applyToVersion)(
            changes
          ).pipe(Effect.provideService(GraphListAccess, service)),
    }))
  )
);

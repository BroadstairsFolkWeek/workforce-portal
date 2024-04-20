import { Effect } from "effect";
import { Schema } from "@effect/schema";
import { GraphListAccess } from "./graph/graph-list-access";
import {
  ModelApplicationChanges,
  ModelApplicationChangesVersioned,
  ModelPersistedApplication,
} from "./interfaces/application";
import { RepositoryConflictError } from "./interfaces/repository-errors";

export class ApplicationNotFound {
  readonly _tag = "ApplicationNotFound";
}

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

export const modelGetApplicationByFilter = (filter: string) => {
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

export const modelGetApplicationByProfileId = (profileId: string) => {
  return modelGetApplicationByFilter(`fields/ProfileId eq '${profileId}'`);
};

export const modelGetApplicationByApplicationId = (applicationId: string) => {
  return modelGetApplicationByFilter(
    `fields/ApplicationId eq '${applicationId}'`
  );
};

export const modelSaveApplicationChanges =
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

import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";

import { WfApiClient } from "../wf-api/wf-client";
import { FormsRepository } from "./forms-repository";
import { FormSubmissionWithSpecAndActions } from "./interfaces/form";

const FormsApiResponseSchema = Schema.Struct({
  data: Schema.Array(FormSubmissionWithSpecAndActions),
});

const getFormsByUserId = (
  userId: string
): Effect.Effect<
  readonly FormSubmissionWithSpecAndActions[],
  never,
  WfApiClient
> =>
  WfApiClient.pipe(
    Effect.andThen((apiClient) =>
      apiClient.getJson(`/api/users/${userId}/profile/forms`)
    ),
    Effect.andThen(Schema.decodeUnknown(FormsApiResponseSchema)),
    Effect.andThen((response) => response.data)
  ).pipe(
    // Parse errors of data from Graph/SharePoint are considered unrecoverable.
    Effect.catchTag("ParseError", (e) => Effect.die(e)),

    Effect.catchTag("RequestError", (e) =>
      Effect.die("Failed to set profile photo: " + e)
    ),
    Effect.catchTag("ResponseError", (e) =>
      Effect.die("Failed to set profile photo: " + e)
    )
  );

export const formsRepositoryLive = Layer.effect(
  FormsRepository,
  Effect.all([WfApiClient]).pipe(
    Effect.andThen(([wfApiClient]) => ({
      modelGetFormsByUserId: (userId: string) =>
        getFormsByUserId(userId).pipe(
          Effect.provideService(WfApiClient, wfApiClient)
        ),
    }))
  )
);

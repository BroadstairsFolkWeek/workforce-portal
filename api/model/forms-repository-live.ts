import { Context, Effect, Layer } from "effect";
import { Schema } from "@effect/schema";

import { WfApiClient } from "../wf-api/wf-client";
import { FormsRepository } from "./forms-repository";
import {
  FormSubmissionId,
  FormSubmissionWithSpecAndActions,
} from "./interfaces/form";

type WfApiClientType = Context.Tag.Service<WfApiClient>;

const FormApiResponseSchema = Schema.Struct({
  data: FormSubmissionWithSpecAndActions,
});

const FormsApiResponseSchema = Schema.Struct({
  data: Schema.Array(FormSubmissionWithSpecAndActions),
});

const getFormsByUserId =
  (apiClient: WfApiClientType) =>
  (
    userId: string
  ): Effect.Effect<readonly FormSubmissionWithSpecAndActions[]> =>
    apiClient
      .getJson(`/api/users/${userId}/profile/forms`)
      .pipe(
        Effect.andThen(Schema.decodeUnknown(FormsApiResponseSchema)),
        Effect.andThen((response) => response.data)
      )
      .pipe(
        // Parse errors of data from WF API are considered unrecoverable.
        Effect.catchTag("ParseError", (e) => Effect.die(e)),

        Effect.catchTag("RequestError", (e) =>
          Effect.die("Failed to get forms: " + e)
        ),
        Effect.catchTag("ResponseError", (e) =>
          Effect.die("Failed to get forms: " + e)
        )
      );

const updateFormSubmission =
  (apiClient: WfApiClientType) =>
  (userId: string) =>
  (formSubmissionId: FormSubmissionId, answers: unknown) =>
    apiClient
      .putJsonDataJsonResponse(
        `/api/users/${userId}/profile/forms/${formSubmissionId}`
      )(answers)
      .pipe(
        Effect.andThen(Schema.decodeUnknown(FormApiResponseSchema)),
        Effect.andThen((response) => response.data)
      )
      .pipe(
        // Parse errors of data from WF API are considered unrecoverable.
        Effect.catchTag("ParseError", (e) => Effect.die(e)),

        Effect.catchTag("RequestError", (e) =>
          Effect.die("Failed to update form: " + e)
        ),
        Effect.catchTag("ResponseError", (e) =>
          Effect.die("Failed to update form: " + e)
        ),
        Effect.catchTag("HttpBodyError", (e) =>
          Effect.die("Failed to update form: " + e)
        )
      );

export const formsRepositoryLive = Layer.effect(
  FormsRepository,
  Effect.all([WfApiClient]).pipe(
    Effect.andThen(([wfApiClient]) =>
      FormsRepository.of({
        modelGetFormsByUserId: getFormsByUserId(wfApiClient),
        modelUpdateFormSubmission: updateFormSubmission(wfApiClient),
      })
    )
  )
);

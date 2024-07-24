import { Context, Effect, Layer } from "effect";
import { Schema } from "@effect/schema";

import { WfApiClient } from "../wf-api/wf-client";
import {
  FormNotFound,
  FormSpecNotFound,
  FormsRepository,
  UnprocessableFormAction,
} from "./forms-repository";
import {
  FormSpec,
  FormSpecId,
  FormSubmissionAction,
  FormSubmissionId,
  FormSubmissionWithSpecAndActions,
} from "./interfaces/form";
import { ProfileNotFound } from "./profiles-repository";

type WfApiClientType = Context.Tag.Service<WfApiClient>;

const FormApiResponseSchema = Schema.Struct({
  data: FormSubmissionWithSpecAndActions,
});

const FormsApiResponseSchema = Schema.Struct({
  data: Schema.Array(FormSubmissionWithSpecAndActions),
});

const CreatableFormsApiResponseSchema = Schema.Struct({
  data: Schema.Array(FormSpec),
});

const getFormsByUserId = (apiClient: WfApiClientType) => (userId: string) =>
  apiClient
    .getJson(`/api/users/${userId}/profile/forms`)
    .pipe(
      Effect.andThen(Schema.decodeUnknown(FormsApiResponseSchema)),
      Effect.andThen((response) => response.data)
    )
    .pipe(
      Effect.catchTags({
        RequestError: (e) => Effect.die("Failed to get forms by user id: " + e),
        ResponseError: (e) => {
          switch (e.response.status) {
            case 404:
              return Effect.fail(new ProfileNotFound());
            default:
              return Effect.die("Failed to get forms by user id: " + e);
          }
        },
        // Parse errors of data from the WF API are considered unrecoverable.
        ParseError: (e) => Effect.die(e),
      })
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
        Effect.catchTags({
          RequestError: (e) => Effect.die("Failed to update form: " + e),
          ResponseError: (e) => {
            switch (e.response.status) {
              case 404:
                return Effect.fail(new FormNotFound());
              default:
                return Effect.die("Failed to update form: " + e);
            }
          },
          HttpBodyError: (e) => Effect.die("Failed to update form: " + e),
          // Parse errors of data from the WF API are considered unrecoverable.
          ParseError: (e) => Effect.die(e),
        })
      );

const deleteFormSubmission =
  (apiClient: WfApiClientType) =>
  (userId: string) =>
  (formSubmissionId: FormSubmissionId) =>
    apiClient
      .deleteNoResponse(
        `/api/users/${userId}/profile/forms/${formSubmissionId}`
      )
      .pipe(
        Effect.catchTags({
          RequestError: (e) => Effect.die("Failed to delete form: " + e),
          ResponseError: (e) => {
            switch (e.response.status) {
              case 404:
                return Effect.fail(new FormNotFound());
              default:
                return Effect.die("Failed to delete form: " + e);
            }
          },
        })
      );

const actionFormSubmission =
  (apiClient: WfApiClientType) =>
  (userId: string) =>
  (formSubmissionId: FormSubmissionId) =>
  (action: FormSubmissionAction) =>
    apiClient
      .postJsonDataJsonResponse(
        `/api/users/${userId}/profile/forms/${formSubmissionId}/action`
      )(action)
      .pipe(
        Effect.andThen(Schema.decodeUnknown(FormApiResponseSchema)),
        Effect.andThen((response) => response.data)
      )
      .pipe(
        Effect.catchTags({
          RequestError: (e) => Effect.die("Failed to action form: " + e),
          ResponseError: (e) => {
            switch (e.response.status) {
              case 404:
                return Effect.fail(new FormNotFound());
              case 422:
                return Effect.fail(new UnprocessableFormAction());
              default:
                return Effect.die("Failed to action form: " + e);
            }
          },
          HttpBodyError: (e) => Effect.die("Failed to action form: " + e),
          // Parse errors of data from the WF API are considered unrecoverable.
          ParseError: (e) => Effect.die(e),
        })
      );

const getCreatableFormSpecsByUserId =
  (apiClient: WfApiClientType) => (userId: string) =>
    apiClient
      .getJson(`/api/users/${userId}/profile/creatableforms`)
      .pipe(
        Effect.andThen(Schema.decodeUnknown(CreatableFormsApiResponseSchema)),
        Effect.andThen((response) => response.data)
      )
      .pipe(
        Effect.catchTags({
          RequestError: (e) => Effect.die("Failed to get form designs: " + e),
          ResponseError: (e) => {
            switch (e.response.status) {
              case 404:
                return Effect.fail(new ProfileNotFound());
              default:
                return Effect.die("Failed to get form designs: " + e);
            }
          },
          // Parse errors of data from the WF API are considered unrecoverable.
          ParseError: (e) => Effect.die(e),
        })
      );

const createFormSubmission =
  (apiClient: WfApiClientType) =>
  (userId: string) =>
  (formSpecId: FormSpecId, answers: unknown) =>
    apiClient
      .postJsonDataJsonResponse(
        `/api/users/${userId}/profile/creatableforms/${formSpecId}/create`
      )(answers)
      .pipe(
        Effect.andThen(Schema.decodeUnknown(FormApiResponseSchema)),
        Effect.andThen((response) => response.data)
      )
      .pipe(
        Effect.catchTags({
          RequestError: (e) => Effect.die("Failed to create form: " + e),
          ResponseError: (e) => {
            switch (e.response.status) {
              case 404:
                return Effect.fail(new FormSpecNotFound());
              default:
                return Effect.die("Failed to create form: " + e);
            }
          },
          HttpBodyError: (e) => Effect.die("Failed to create form: " + e),
          // Parse errors of data from the WF API are considered unrecoverable.
          ParseError: (e) => Effect.die(e),
        })
      );

export const formsRepositoryLive = Layer.effect(
  FormsRepository,
  Effect.all([WfApiClient]).pipe(
    Effect.andThen(([wfApiClient]) =>
      FormsRepository.of({
        modelGetFormsByUserId: getFormsByUserId(wfApiClient),
        modelUpdateFormSubmission: updateFormSubmission(wfApiClient),
        modelDeleteFormSubmission: deleteFormSubmission(wfApiClient),
        modelActionFormSubmission: actionFormSubmission(wfApiClient),
        modelGetCreatableFormSpecsByUserId:
          getCreatableFormSpecsByUserId(wfApiClient),
        modelCreateFormSubmission: createFormSubmission(wfApiClient),
      })
    )
  )
);

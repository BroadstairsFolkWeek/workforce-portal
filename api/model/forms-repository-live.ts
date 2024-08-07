import { Context, Effect, Layer } from "effect";
import { Schema } from "@effect/schema";

import { WfApiClient } from "../wf-api/wf-client";
import {
  FormNotFound,
  TemplateNotFound,
  FormsRepository,
  UnprocessableFormAction,
} from "./forms-repository";
import {
  Template,
  TemplateId,
  FormAction,
  FormId,
  Form,
} from "./interfaces/form";
import { ProfileNotFound } from "./profiles-repository";

type WfApiClientType = Context.Tag.Service<WfApiClient>;

const FormApiResponseSchema = Schema.Struct({
  data: Form,
});

const FormsApiResponseSchema = Schema.Struct({
  data: Schema.Array(Form),
});

const CreatableFormsApiResponseSchema = Schema.Struct({
  data: Schema.Array(Template),
});

const getFormsByUserId = (apiClient: WfApiClientType) => (userId: string) =>
  apiClient
    .getJson(`/api/users/${userId}/forms`)
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

const updateForm =
  (apiClient: WfApiClientType) =>
  (userId: string) =>
  (formId: FormId, answers: unknown) =>
    apiClient
      .putJsonDataJsonResponse(`/api/users/${userId}/forms/${formId}/answers`)({
        answers,
      })
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

const deleteForm =
  (apiClient: WfApiClientType) => (userId: string) => (formId: FormId) =>
    apiClient.deleteNoResponse(`/api/users/${userId}/forms/${formId}`).pipe(
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

const actionForm =
  (apiClient: WfApiClientType) =>
  (userId: string) =>
  (formId: FormId) =>
  (action: FormAction) =>
    apiClient
      .postJsonDataJsonResponse(`/api/users/${userId}/forms/${formId}/action`)(
        action
      )
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

const getCreatableFormTemplatesByUserId =
  (apiClient: WfApiClientType) => (userId: string) =>
    apiClient
      .getJson(`/api/users/${userId}/creatableforms`)
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

const createForm =
  (apiClient: WfApiClientType) =>
  (userId: string) =>
  (templateId: TemplateId, answers: unknown) =>
    apiClient
      .postJsonDataJsonResponse(
        `/api/users/${userId}/creatableforms/${templateId}/create`
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
                return Effect.fail(new TemplateNotFound());
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
        modelUpdateForm: updateForm(wfApiClient),
        modelDeleteForm: deleteForm(wfApiClient),
        modelActionForm: actionForm(wfApiClient),
        modelGetCreatableFormTemplatesByUserId:
          getCreatableFormTemplatesByUserId(wfApiClient),
        modelCreateForm: createForm(wfApiClient),
      })
    )
  )
);

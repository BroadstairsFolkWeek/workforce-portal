import { Effect } from "effect";
import { Schema as S } from "@effect/schema";
import {
  apiDeleteJsonResponse,
  apiPostJsonData,
  apiPutJsonData,
  NotAuthenticated,
  ServerError,
} from "./api";
import {
  ActionFormResponse,
  CreateFormResponse,
  DeleteFormResponse,
  SaveFormResponse,
} from "./interfaces/forms";
import { TemplateId, FormAction, FormId } from "../interfaces/form";

export const apiSaveForm = (formId: FormId) => (answers: unknown) =>
  apiPutJsonData(`/api/forms/${formId}`)(answers)
    .pipe(Effect.andThen(S.decodeUnknown(SaveFormResponse)))
    .pipe(Effect.andThen((decoded) => decoded.data))
    .pipe(
      Effect.catchTags({
        ParseError: (e) => Effect.die(e),
        RequestError: (e) => Effect.die("Failed to save form: " + e),
        ResponseError: (e) => {
          switch (e.response.status) {
            case 401:
              return Effect.fail(new NotAuthenticated());
            default:
              return Effect.fail(new ServerError({ responseError: e }));
          }
        },
        HttpBodyError: (e) => Effect.die(e),
      })
    );

export const apiActionForm = (formId: FormId) => (action: FormAction) =>
  apiPostJsonData(`/api/formAction/${formId}`)(action)
    .pipe(Effect.andThen(S.decodeUnknown(ActionFormResponse)))
    .pipe(Effect.andThen((decoded) => decoded.data))
    .pipe(
      Effect.catchTags({
        ParseError: (e) => Effect.die(e),
        RequestError: (e) => Effect.die("Failed to action form: " + e),
        ResponseError: (e) =>
          e.response.status === 401
            ? Effect.fail(new NotAuthenticated())
            : Effect.fail(new ServerError({ responseError: e })),
        HttpBodyError: (e) => Effect.die(e),
      })
    );

export const apiDeleteForm = (formId: FormId) =>
  apiDeleteJsonResponse(`/api/formDelete/${formId}`).pipe(
    Effect.andThen(S.decodeUnknown(DeleteFormResponse)),
    Effect.andThen((decoded) => decoded.data),
    Effect.catchTags({
      RequestError: (e) => Effect.die("Failed to delete form: " + e),
      ResponseError: (e) =>
        e.response.status === 401
          ? Effect.fail(new NotAuthenticated())
          : Effect.fail(new ServerError({ responseError: e })),
    })
  );

export const apiCreateForm = (templateId: TemplateId) => (answers: unknown) =>
  apiPostJsonData(`/api/formNew/${templateId}`)({ answers })
    .pipe(Effect.andThen(S.decodeUnknown(CreateFormResponse)))
    .pipe(Effect.andThen((decoded) => decoded.data))
    .pipe(
      Effect.catchTags({
        ParseError: (e) => Effect.die(e),
        RequestError: (e) => Effect.die("Failed to save form: " + e),
        ResponseError: (e) => {
          switch (e.response.status) {
            case 401:
              return Effect.fail(new NotAuthenticated());
            default:
              return Effect.fail(new ServerError({ responseError: e }));
          }
        },
        HttpBodyError: (e) => Effect.die(e),
      })
    );

import { Effect } from "effect";
import { Schema as S } from "@effect/schema";
import {
  apiDelete,
  apiPostJsonData,
  apiPutJsonData,
  NotAuthenticated,
  ServerError,
  VersionConflict,
} from "./api";
import {
  ActionFormResponse,
  SaveApplicationResponse,
  SaveFormResponse,
} from "./interfaces/forms";
import { Application } from "../interfaces/application";
import { FormSubmissionAction, FormSubmissionId } from "../interfaces/form";

export const apiSaveApplication = (application: Application) =>
  apiPostJsonData("/api/saveApplication")(application)
    .pipe(Effect.andThen(S.decodeUnknown(SaveApplicationResponse)))
    .pipe(Effect.andThen((decoded) => decoded as Application))
    .pipe(
      Effect.catchTags({
        ParseError: (e) => Effect.die(e),
        RequestError: (e) => Effect.die("Failed to save profile: " + e),
        ResponseError: (e) =>
          e.response.status === 401
            ? Effect.fail(new NotAuthenticated())
            : e.response.status === 409
            ? Effect.fail(new VersionConflict())
            : Effect.fail(new ServerError({ responseError: e })),
        HttpBodyError: (e) => Effect.die(e),
      })
    );

export const apiSaveForm =
  (formSubmissionId: FormSubmissionId) => (answers: unknown) =>
    apiPutJsonData(`/api/forms/${formSubmissionId}`)(answers)
      .pipe(Effect.andThen(S.decodeUnknown(SaveFormResponse)))
      .pipe(Effect.andThen((decoded) => decoded.data))
      .pipe(
        Effect.catchTags({
          ParseError: (e) => Effect.die(e),
          RequestError: (e) => Effect.die("Failed to save form: " + e),
          ResponseError: (e) =>
            e.response.status === 401
              ? Effect.fail(new NotAuthenticated())
              : Effect.fail(new ServerError({ responseError: e })),
          HttpBodyError: (e) => Effect.die(e),
        })
      );

export const apiActionForm =
  (formSubmissionId: FormSubmissionId) => (action: FormSubmissionAction) =>
    apiPostJsonData(`/api/formAction/${formSubmissionId}`)(action)
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

export const apiDeleteForm = (formSubmissionId: FormSubmissionId) =>
  apiDelete(`/api/forms/${formSubmissionId}`).pipe(
    Effect.catchTags({
      RequestError: (e) => Effect.die("Failed to action form: " + e),
      ResponseError: (e) =>
        e.response.status === 401
          ? Effect.fail(new NotAuthenticated())
          : Effect.fail(new ServerError({ responseError: e })),
    })
  );

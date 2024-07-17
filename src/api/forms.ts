import { Effect } from "effect";
import { Schema as S } from "@effect/schema";
import {
  apiPostJsonData,
  NotAuthenticated,
  ServerError,
  VersionConflict,
} from "./api";
import { SaveApplicationResponse } from "./interfaces/forms";
import { Application } from "../interfaces/application";

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

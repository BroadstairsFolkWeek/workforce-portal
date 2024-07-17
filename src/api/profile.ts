import { Effect } from "effect";
import { Schema as S } from "@effect/schema";
import { ProfileUpdate } from "../interfaces/profile";
import { GetProfileResponse } from "./interfaces/profile";
import {
  apiGetJson,
  apiPostJsonData,
  NotAuthenticated,
  ServerError,
  VersionConflict,
} from "./api";

export const apiFetchProfile = () =>
  apiGetJson("/api/profile")
    .pipe(
      Effect.andThen(S.decodeUnknown(GetProfileResponse)),
      Effect.andThen((response) => response.data)
    )
    .pipe(
      Effect.catchTags({
        ParseError: (e) => Effect.die(e),
        RequestError: (e) => Effect.die("Failed to request profile: " + e),
        ResponseError: (e) =>
          e.response.status === 401
            ? Effect.fail(new NotAuthenticated())
            : Effect.fail(new ServerError({ responseError: e })),
      })
    );

export const apiSaveProfile = (version: number, updates: ProfileUpdate) =>
  apiPostJsonData("/api/updateProfile")({ version, updates })
    .pipe(
      Effect.andThen(S.decodeUnknown(GetProfileResponse)),
      Effect.andThen((response) => response.data)
    )
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

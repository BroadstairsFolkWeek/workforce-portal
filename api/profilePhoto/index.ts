import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Data, Effect, Logger, LogLevel, Option } from "effect";
import { Schema as S } from "@effect/schema";

import { createLoggerLayer } from "../utilties/logging";
import {
  getProfileWithFormsByProfile,
  setProfilePicture,
} from "../services/profile-service";
import { repositoriesLayerLive } from "../contexts/repositories-live";
import { SetProfilePhotoResponse } from "../api/photo";
import { getAuthenticatedUserId } from "../functions/authenticated-user";

class NoBodyBuffer extends Data.TaggedClass("NoBodyBuffer") {}

const getBodyBuffer = (req: HttpRequest) =>
  Option.fromNullable(req.bufferBody).pipe(
    Effect.catchTags({
      NoSuchElementException: () => Effect.fail(new NoBodyBuffer()),
    })
  );

class NoContentTypeHeader extends Data.TaggedClass("NoContentTypeHeader") {}

const getContentType = (req: HttpRequest) =>
  Option.fromNullable(req.headers["content-type"]).pipe(
    Effect.catchTags({
      NoSuchElementException: () => Effect.fail(new NoContentTypeHeader()),
    })
  );

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const program = Effect.logTrace("profilePhoto: entry").pipe(
    Effect.andThen(() =>
      Effect.all([
        getAuthenticatedUserId(req),
        getBodyBuffer(req),
        getContentType(req),
      ])
    ),
    Effect.andThen(([userId, buffer, contentType]) =>
      setProfilePicture(userId, contentType, buffer).pipe(
        Effect.andThen(getProfileWithFormsByProfile(userId)),
        Effect.andThen((data) => ({ data })),
        Effect.andThen(S.encode(SetProfilePhotoResponse)),
        Effect.andThen((body) =>
          Effect.succeed({
            status: 200,
            body,
          })
        ),
        Effect.catchTags({
          ParseError: (e) =>
            Effect.logError(
              `ParseError when setting profile photo for user ${userId}`,
              e
            ).pipe(Effect.andThen(Effect.succeed({ status: 500 }))),
        })
      )
    ),
    Effect.catchTags({
      ProfileNotFound: () => Effect.succeed({ status: 404 }),
      NoBodyBuffer: () =>
        Effect.succeed({ status: 400, body: "No profile image uploaded" }),
      NoContentTypeHeader: () =>
        Effect.succeed({
          status: 400,
          body: "No content type included in request",
        }),
      UserNotAuthenticated: () => Effect.succeed({ status: 401 }),
    })
  );

  const logLayer = createLoggerLayer(context);

  context.res = await Effect.runPromise(
    program.pipe(
      Effect.provide(repositoriesLayerLive),
      Logger.withMinimumLogLevel(LogLevel.Trace),
      Effect.provide(logLayer)
    )
  );
};

export default httpTrigger;

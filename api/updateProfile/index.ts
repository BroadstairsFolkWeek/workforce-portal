import { Effect, LogLevel, Logger } from "effect";
import { Schema as S } from "@effect/schema";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  getOrCreateProfileForAuthenticatedUserEffect,
  updateUserProfileEffect,
} from "../services/profile-service";
import { createLoggerLayer } from "../utilties/logging";
import { getAuthenticatedUserId } from "../functions/authenticated-user";
import { ApiProfileUpdateRequest, UpdateProfileResponse } from "../api/profile";
import { repositoriesLayerLive } from "../contexts/repositories-live";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const program = Effect.logTrace("updateProfile: entry")
    .pipe(
      Effect.andThen(getAuthenticatedUserId(req)),
      Effect.andThen((userId) =>
        S.decodeUnknown(ApiProfileUpdateRequest)(req.body).pipe(
          Effect.andThen((updateRequest) =>
            updateUserProfileEffect(
              updateRequest.updates,
              userId,
              updateRequest.version
            )
          ),
          Effect.andThen((updateResult) => ({
            data: {
              profile: updateResult.profile,
              forms: updateResult.forms,
              creatableForms: updateResult.creatableForms,
            },
          })),
          Effect.andThen(S.encode(UpdateProfileResponse)),
          Effect.andThen((body) => ({
            status: 200 as const,
            body,
          })),
          Effect.catchTag("ProfileVersionMismatch", () =>
            getOrCreateProfileForAuthenticatedUserEffect(userId).pipe(
              Effect.andThen((body) => ({
                status: 409 as const,
                body,
              }))
            )
          )
        )
      )
    )
    .pipe(
      Effect.catchTags({
        ParseError: () => Effect.succeed({ status: 400 as const }),
        ProfileNotFound: () => Effect.succeed({ status: 404 as const }),
        UserNotAuthenticated: () => Effect.succeed({ status: 401 as const }),
        GraphUserNotFound: () => Effect.succeed({ status: 404 as const }),
      })
    );

  const logLayer = createLoggerLayer(context);

  context.res = await Effect.runPromise(
    program.pipe(
      Effect.provide(repositoriesLayerLive),
      Logger.withMinimumLogLevel(LogLevel.Debug),
      Effect.provide(logLayer)
    )
  );
};

export default httpTrigger;

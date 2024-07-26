import { Effect, LogLevel, Logger } from "effect";
import { Schema as S } from "@effect/schema";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getOrCreateProfileForAuthenticatedUserEffect } from "../services/profile-service";
import { createLoggerLayer } from "../utilties/logging";
import { repositoriesLayerLive } from "../contexts/repositories-live";
import { getAuthenticatedUserId } from "../functions/authenticated-user";
import { GetProfileResponse } from "../api/profile";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const program = Effect.logTrace("profile: entry")
    .pipe(
      Effect.andThen(getAuthenticatedUserId(req)),
      Effect.andThen(getOrCreateProfileForAuthenticatedUserEffect),
      Effect.tap(Effect.logDebug("Got or created a profile")),
      Effect.andThen((a) => ({ data: a })),
      Effect.andThen(S.encode(GetProfileResponse)),
      Effect.andThen((body) => ({
        status: 200 as const,
        body,
      }))
    )
    .pipe(
      Effect.catchTags({
        UserNotAuthenticated: () => Effect.succeed({ status: 401 as const }),
        GraphUserNotFound: () => Effect.succeed({ status: 404 as const }),
        ParseError: () => Effect.succeed({ status: 500 as const }),
      })
    );

  const logLayer = createLoggerLayer(context);

  const runnable = program.pipe(
    Effect.provide(repositoriesLayerLive),
    Logger.withMinimumLogLevel(LogLevel.Trace),
    Effect.provide(logLayer)
  );

  context.res = await Effect.runPromise(runnable);
};

export default httpTrigger;

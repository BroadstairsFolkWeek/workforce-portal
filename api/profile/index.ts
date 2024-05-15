import { Effect, LogLevel, Logger, Option } from "effect";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getOrCreateProfileForAuthenticatedUserEffect } from "../services/profile-service";
import { createLoggerLayer } from "../utilties/logging";
import { repositoriesLayerLive } from "../contexts/repositories-live";
import { getAuthenticatedUserId } from "../functions/authenticated-user";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const getProfileEffect = Effect.logTrace("profile: entry")
    .pipe(
      Effect.andThen(getAuthenticatedUserId(req)),
      Effect.andThen(getOrCreateProfileForAuthenticatedUserEffect),
      Effect.tap(Effect.logDebug("Got or created a profile")),
      Effect.andThen((profileWithOptionalApplication) =>
        Option.match({
          onSome: (application) =>
            Effect.succeed({
              profile: profileWithOptionalApplication.profile,
              application: application,
            }),
          onNone: () =>
            Effect.succeed({
              profile: profileWithOptionalApplication.profile,
            }),
        })(profileWithOptionalApplication.application)
      ),
      Effect.andThen((body) => ({
        status: 200 as const,
        body,
      }))
    )
    .pipe(
      Effect.catchTag("ProfileNotFound", () =>
        Effect.succeed({
          status: 404 as const,
          body: "Profile does not exist",
        })
      ),
      Effect.catchTag("GraphUserNotFound", () =>
        Effect.succeed({
          status: 404 as const,
          body: "Graph user does not exist",
        })
      ),
      Effect.catchTag("UserNotAuthenticated", () =>
        Effect.succeed({ status: 401 as const })
      )
    );

  const logLayer = createLoggerLayer(context);

  context.res = await Effect.runPromise(
    getProfileEffect.pipe(
      Effect.provide(repositoriesLayerLive),
      Logger.withMinimumLogLevel(LogLevel.Debug),
      Effect.provide(logLayer)
    )
  );
};

export default httpTrigger;

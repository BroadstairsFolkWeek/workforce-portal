import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { deleteUser } from "../services/delete-user-service";
import { createLoggerLayer } from "../utilties/logging";
import { Effect, Logger, LogLevel } from "effect";
import { getAuthenticatedUserId } from "../functions/authenticated-user";
import { repositoriesLayerLive } from "../contexts/repositories-live";
import { logoutHandler } from "../services/auth-handler";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
) {
  const program = Effect.logTrace("deleteUser: entry")
    .pipe(
      Effect.andThen(getAuthenticatedUserId(req)),
      Effect.tap((userId) =>
        Effect.logDebug(
          `deleteUser: User is authenticated. User ID: ${userId}}`
        )
      ),
      Effect.andThen((userId) =>
        deleteUser(userId).pipe(
          Effect.tap((userId) =>
            Effect.logInfo(
              `deleteUser: User login and profile deleted. User ID: ${userId}}`
            )
          )
        )
      ),
      Effect.andThen(() => logoutHandler(req))
    )
    .pipe(
      Effect.catchTag("UserNotAuthenticated", () =>
        Effect.succeed({ status: 401 as const })
      )
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

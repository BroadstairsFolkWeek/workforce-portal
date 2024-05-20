import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Effect, LogLevel, Logger } from "effect";
import { Schema as S } from "@effect/schema";

import { deleteApplicationEffect } from "../services/application-service";
import { createLoggerLayer } from "../utilties/logging";
import { getAuthenticatedUserId } from "../functions/authenticated-user";
import { ApiDeleteApplicationRequestBody } from "../api/delete-application";
import { repositoriesLayerLive } from "../contexts/repositories-live";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const deleteApplicationProgram = Effect.logTrace(
    `deleteApplication: entry. Version: ${req.body?.version}`
  )
    .pipe(
      Effect.andThen(
        S.decodeUnknown(ApiDeleteApplicationRequestBody)(req.body)
      ),
      Effect.andThen(
        (deleteApplicationRequest) => deleteApplicationRequest.version
      ),
      Effect.andThen((version) =>
        getAuthenticatedUserId(req).pipe(
          Effect.andThen((userId) => deleteApplicationEffect(userId, version))
        )
      )
    )
    .pipe(
      Effect.andThen(() =>
        Effect.succeed({
          status: 204 as const,
        })
      ),
      Effect.catchTags({
        ParseError: () =>
          Effect.succeed({
            status: 400 as const,
            body: "Delete requests must include the latest known version number of the user's application.",
          }),
        UserNotAuthenticated: () =>
          Effect.succeed({
            status: 401 as const,
          }),
        UnknownUser: () => Effect.succeed({ status: 500 as const }),
        ProfileNotFound: () => Effect.succeed({ status: 400 as const }),
        ApplicationNotFound: () =>
          Effect.succeed({
            status: 404 as const,
            body: "Application not found",
          }),
        ApplicationVersionMismatch: () =>
          Effect.succeed({
            status: 409 as const,
            body: "Version number mismatch",
          }),
      })
    );

  const logLayer = createLoggerLayer(context);

  context.res = await Effect.runPromise(
    deleteApplicationProgram.pipe(
      Effect.provide(repositoriesLayerLive),
      Logger.withMinimumLogLevel(LogLevel.Debug),
      Effect.provide(logLayer)
    )
  );
};

export default httpTrigger;

import { Effect, Logger, LogLevel } from "effect";
import { Schema } from "@effect/schema";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createLoggerLayer } from "../utilties/logging";
import { getAuthenticatedUserId } from "../functions/authenticated-user";
import {
  FormSubmissionAction,
  FormSubmissionId,
} from "../model/interfaces/form";
import { PostFormSubmissionActionResponse } from "../api/form";
import { repositoriesLayerLive } from "../contexts/repositories-live";
import { ApiInvalidRequest } from "../api/api";
import { actionFormSubmission } from "../services/forms-service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const formSubmissionIdEffect = Schema.decodeUnknown(FormSubmissionId)(
    req.params["formSubmissionId"]
  ).pipe(
    Effect.catchTag("ParseError", () => Effect.fail(new ApiInvalidRequest()))
  );

  const formActionEffect = Effect.succeed(req.body).pipe(
    Effect.andThen(Schema.decodeUnknown(FormSubmissionAction)),
    Effect.catchTag("ParseError", () => Effect.fail(new ApiInvalidRequest()))
  );

  const authenticatedUserIdEffect = getAuthenticatedUserId(req);

  const program = Effect.logTrace("formAction: entry").pipe(
    Effect.andThen(
      Effect.all([
        formSubmissionIdEffect,
        formActionEffect,
        authenticatedUserIdEffect,
      ])
        .pipe(
          Effect.andThen(([formSubmissionId, action, authenticedUserId]) =>
            actionFormSubmission(authenticedUserId)(formSubmissionId)(action)
          )
        )
        .pipe(
          Effect.andThen((form) => ({ data: form })),
          Effect.andThen(Schema.encode(PostFormSubmissionActionResponse)),
          Effect.andThen((body) => ({
            status: 200 as const,
            body,
          }))
        )
        .pipe(
          Effect.catchTags({
            ParseError: () => Effect.succeed({ status: 500 as const }),
            UserNotAuthenticated: () =>
              Effect.succeed({ status: 401 as const }),
            ApiInvalidRequest: () => Effect.succeed({ status: 400 as const }),
          })
        )
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

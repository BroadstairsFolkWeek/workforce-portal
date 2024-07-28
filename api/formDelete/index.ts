import { Effect, Logger, LogLevel } from "effect";
import { Schema } from "@effect/schema";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createLoggerLayer } from "../utilties/logging";
import { getAuthenticatedUserId } from "../functions/authenticated-user";
import { FormId } from "../model/interfaces/form";
import { repositoriesLayerLive } from "../contexts/repositories-live";
import { ApiInvalidRequest } from "../api/api";
import { deleteFormSubmission } from "../services/forms-service";
import { DeleteFormResponseBody } from "../api/form";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const formSubmissionIdEffect = Schema.decodeUnknown(FormId)(
    req.params["formSubmissionId"]
  ).pipe(
    Effect.catchTag("ParseError", () => Effect.fail(new ApiInvalidRequest()))
  );

  const authenticatedUserIdEffect = getAuthenticatedUserId(req);

  const program = Effect.logTrace("formDelete: entry").pipe(
    Effect.andThen(
      Effect.all([formSubmissionIdEffect, authenticatedUserIdEffect])
        .pipe(
          Effect.andThen(([formSubmissionId, authenticedUserId]) =>
            deleteFormSubmission(authenticedUserId)(formSubmissionId)
          ),
          Effect.andThen((creatableForms) => ({ data: { creatableForms } })),
          Effect.andThen(Schema.encode(DeleteFormResponseBody)),
          Effect.andThen((body) => ({
            status: 200 as const,
            body,
          }))
        )
        .pipe(
          Effect.catchTags({
            UserNotAuthenticated: () =>
              Effect.succeed({ status: 401 as const }),
            ApiInvalidRequest: () => Effect.succeed({ status: 400 as const }),
            FormNotFound: () => Effect.succeed({ status: 404 as const }),
            ProfileNotFound: () => Effect.succeed({ status: 404 as const }),
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

import { Effect, Logger, LogLevel } from "effect";
import { Schema } from "@effect/schema";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createLoggerLayer } from "../utilties/logging";
import { getAuthenticatedUserId } from "../functions/authenticated-user";
import { TemplateId } from "../model/interfaces/form";
import { PostNewFormRequestBody, PostNewFormResponseBody } from "../api/form";
import { repositoriesLayerLive } from "../contexts/repositories-live";
import { ApiInvalidRequest } from "../api/api";
import { createForm } from "../services/forms-service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const templateIdEffect = Schema.decodeUnknown(TemplateId)(
    req.params["templateId"]
  ).pipe(
    Effect.catchTag("ParseError", () => Effect.fail(new ApiInvalidRequest()))
  );

  const requestBodyEffect = Effect.succeed(req.body).pipe(
    Effect.andThen(Schema.decodeUnknown(PostNewFormRequestBody)),
    Effect.catchTag("ParseError", () => Effect.fail(new ApiInvalidRequest()))
  );

  const authenticatedUserIdEffect = getAuthenticatedUserId(req);

  const program = Effect.logTrace("formAction: entry").pipe(
    Effect.andThen(
      Effect.all([
        templateIdEffect,
        requestBodyEffect,
        authenticatedUserIdEffect,
      ])
        .pipe(
          Effect.andThen(([templateId, requestBody, authenticedUserId]) =>
            createForm(authenticedUserId)(templateId)(requestBody)
          )
        )
        .pipe(
          Effect.andThen((result) => ({
            data: { form: result.form, creatableForms: result.templates },
          })),
          Effect.andThen(Schema.encode(PostNewFormResponseBody)),
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
            TemplateNotFound: () => Effect.succeed({ status: 404 as const }),
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

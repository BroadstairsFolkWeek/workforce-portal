import { Effect, Logger, LogLevel } from "effect";
import { Schema } from "@effect/schema";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createLoggerLayer } from "../utilties/logging";
import { getAuthenticatedUserId } from "../functions/authenticated-user";
import { updateFormSubmission } from "../services/forms-service";
import { FormId } from "../model/interfaces/form";
import { PutProfileResponse } from "../api/form";
import { repositoriesLayerLive } from "../contexts/repositories-live";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const formSubmissionId: string = req.params["formSubmissionId"];

  const program = Effect.logTrace("forms: entry")
    .pipe(
      Effect.andThen(getAuthenticatedUserId(req)),
      Effect.andThen((userId) =>
        updateFormSubmission(userId)(FormId.make(formSubmissionId))(req.body)
      ),
      Effect.andThen((form) => ({ data: form })),
      Effect.andThen(Schema.encode(PutProfileResponse)),
      Effect.andThen((body) => ({
        status: 200 as const,
        body,
      }))
    )
    .pipe(
      Effect.catchTags({
        ParseError: (e) => Effect.die(e),
        UserNotAuthenticated: () => Effect.succeed({ status: 401 as const }),
        FormNotFound: () => Effect.succeed({ status: 404 as const }),
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

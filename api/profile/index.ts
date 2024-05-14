import { Effect, Option } from "effect";
import { getUserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getOrCreateProfileForAuthenticatedUserEffect } from "../services/profile-service";
import { isUserServiceError } from "../services/user-service";
import { logError, logTrace, setLoggerFromContext } from "../utilties/logging";
import { repositoriesLayerLive } from "../contexts/repositories-live";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);
  logTrace("profile: entry");
  logTrace("headers: " + JSON.stringify(req.headers, null, 2));

  const userInfo = getUserInfo(req);
  if (userInfo) {
    try {
      const userProfileWithOptionalApplicationEffect =
        getOrCreateProfileForAuthenticatedUserEffect(userInfo.userId!)
          .pipe(
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
            )
          );

      context.res = await Effect.runPromise(
        userProfileWithOptionalApplicationEffect.pipe(
          Effect.provide(repositoriesLayerLive)
        )
      );
    } catch (err) {
      if (isUserServiceError(err)) {
        switch (err.error) {
          case "unauthenticated":
            context.res = {
              status: 401,
              body: "Cannot retrieve profile when not authenticated.",
            };
            break;

          default:
            logError(
              "profile: Unhandled UserServiceError: " +
                err.error +
                ": " +
                err.arg1
            );
            context.res = {
              status: 500,
            };
            break;
        }
      } else {
        logError("profile: Unhandle error: " + err);
        context.res = {
          status: 500,
        };
      }
    }
  } else {
    context.res = {
      status: 401,
      body: "Cannot retrieve profile when not authenticated.",
    };
  }
};

export default httpTrigger;

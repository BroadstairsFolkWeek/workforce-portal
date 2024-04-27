import { getUserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getOrCreateProfileForAuthenticatedUser } from "../services/profile-service";
import { isUserServiceError } from "../services/user-service";
import {
  logError,
  logTrace,
  logWarn,
  setLoggerFromContext,
} from "../utilties/logging";

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
      const userProfile = await getOrCreateProfileForAuthenticatedUser(
        userInfo.userId!
      );
      if (userProfile) {
        logTrace("profile: Got profile: " + JSON.stringify(userProfile));
        context.res = {
          body: userProfile,
        };
      } else {
        logWarn("profile: Profile does not exist and was not created.");
        context.res = {
          status: 404,
          body: "Profile does not exist",
        };
      }
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

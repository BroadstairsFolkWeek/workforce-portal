import { getUserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  getApplication,
  isApplicationServiceError,
} from "../services/application-service";
import { logError, logTrace, setLoggerFromContext } from "../utilties/logging";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);
  logTrace("getApplication: entry");

  const userInfo = getUserInfo(req);
  if (userInfo) {
    logTrace(
      `getApplication: User is authenticated. User ID: ${userInfo.userId}/${userInfo.identityProvider}`
    );

    try {
      const application = await getApplication(userInfo);
      context.res = {
        status: 200,
        body: application,
      };
    } catch (err) {
      if (isApplicationServiceError(err)) {
        if (err.error === "application-not-found") {
          logTrace(`getApplication: Application not found for user.`);
          context.res = {
            status: 404,
            body: "Application not found",
          };
        } else {
          logError(
            `getApplication: Unrecognised application error: ${
              err.error
            } - ${err.arg1?.toString()}`
          );
          context.res = {
            status: 500,
            body: "Unknown application service error",
          };
        }
      } else {
        logError(`getApplication: Unknown error: ${err.message}`);
        throw err;
      }
    }
  } else {
    logTrace(`getApplication: User is not authenticated.`);
    context.res = {
      status: 401,
      body: "Cannot get application when not authenticated.",
    };
  }
};

export default httpTrigger;

import { getUserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  deleteApplication,
  isApplicationServiceError,
} from "../services/application-service";
import { logError, logTrace, setLoggerFromContext } from "../utilties/logging";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);
  logTrace(`deleteApplication: entry. Version: ${req.body?.version}`);

  const version: number = req.body?.version;
  if (version === undefined) {
    logError(
      `deleteApplication: entry. Version property not provided in request body.`
    );
    context.res = {
      status: 400,
      body: "Delete requests must include the latest known version number of the user's application.",
    };
  } else {
    const userInfo = getUserInfo(req);
    if (userInfo) {
      logTrace(
        `deleteApplication: User is authenticated. User ID: ${userInfo.userId}/${userInfo.identityProvider}`
      );

      try {
        await deleteApplication(userInfo, version);
        context.res = {
          status: 204,
        };
      } catch (err) {
        if (isApplicationServiceError(err)) {
          if (err.error === "application-not-found") {
            logTrace(`deleteApplication: Application not found for user.`);
            context.res = {
              status: 404,
              body: "Application not found",
            };
          } else if (err.error === "version-conflict") {
            logTrace(
              `deleteApplication: Mismatch on stored application version number.`
            );
            context.res = {
              status: 409,
              body: "Version number mismatch",
            };
          } else {
            logError(
              `deleteApplication: Unrecognised application error: ${
                err.error
              } - ${err.arg1?.toString()}`
            );
            context.res = {
              status: 500,
              body: "Unknown application service error",
            };
          }
        } else {
          logError(`deleteApplication: Unknown error: ${err.message}`);
          throw err;
        }
      }
    } else {
      logTrace(`deleteApplication: User is not authenticated.`);
      context.res = {
        status: 401,
        body: "Cannot get application when not authenticated.",
      };
    }
  }
};

export default httpTrigger;

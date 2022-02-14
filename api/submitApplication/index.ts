import { getUserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  isApplicationServiceError,
  submitApplication,
} from "../services/application-service";
import { isUserServiceError } from "../services/user-service";
import { logError, logTrace, setLoggerFromContext } from "../utilties/logging";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);
  logTrace("submitApplication: entry");

  const userInfo = getUserInfo(req);
  if (userInfo) {
    logTrace(
      `submitApplication: User is authenticated. User ID: ${userInfo.userId}/${userInfo.identityProvider}`
    );

    try {
      const submittedApplication = await submitApplication(userInfo);
      context.res = { status: 200, body: submittedApplication };
    } catch (err) {
      if (isUserServiceError(err)) {
        if (err.error === "unauthenticated") {
          logTrace(`submitApplication: User is not authenticated.`);
          context.res = {
            status: 401,
            body: "Cannot submit application when not authenticated.",
          };
        } else {
          logError(
            `submitApplication: Unrecognised user service error: ${
              err.error
            } - ${err.arg1?.toString()}`
          );
          context.res = {
            status: 500,
            body: "Unknown user service error",
          };
        }
      } else if (isApplicationServiceError(err)) {
        if (err.error === "application-not-found") {
          context.res = {
            status: 404,
            body: "Application not found",
          };
        } else if (err.error === "application-in-wrong-state") {
          context.res = {
            status: 409,
            body: err.arg1,
          };
        } else {
          logError(
            `submitApplication: Unrecognised application service error: ${
              err.error
            } - ${err.arg1?.toString()}`
          );
          context.res = {
            status: 500,
            body: "Unknown application service error",
          };
        }
      } else {
        logError(`submitApplication: Unknown error: ${err.message}`);
        throw err;
      }
    }
  } else {
    logTrace(`submitApplication: User is not authenticated.`);
    context.res = {
      status: 401,
      body: "Cannot submit application when not authenticated.",
    };
  }
};

export default httpTrigger;

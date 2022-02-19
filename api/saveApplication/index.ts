import { getUserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { sanitiseApplicationFromApiClient } from "../services/api-sanitise-service";
import {
  isApplicationServiceError,
  saveApplication,
} from "../services/application-service";
import { isProfileServiceError } from "../services/profile-service";
import { isUserServiceError } from "../services/user-service";
import {
  logError,
  logInfo,
  logTrace,
  setLoggerFromContext,
} from "../utilties/logging";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);
  logTrace("saveApplication: entry");

  const userInfo = getUserInfo(req);
  if (userInfo) {
    logTrace(
      `saveApplication: User is authenticated. User ID: ${userInfo.userId}/${userInfo.identityProvider}`
    );

    try {
      const application = sanitiseApplicationFromApiClient(req.body);
      const savedApplication = await saveApplication(application, userInfo);
      context.res = { status: 200, body: savedApplication };
    } catch (err) {
      if (isProfileServiceError(err)) {
        if (err.error === "missing-user-profile") {
          logError(
            `saveApplication: User profile does not exist for authenticated user. User ID: ${userInfo.userId}/${userInfo.identityProvider}`
          );
          context.res = {
            status: 404,
            body: "User Profile does not exist, cannot save application.",
          };
        } else {
          logError(
            `saveApplication: Unrecognised profile service error: ${
              err.error
            } - ${err.arg1?.toString()}`
          );
          context.res = {
            status: 500,
            body: "Unknown profile service error",
          };
        }
      } else if (isUserServiceError(err)) {
        if (err.error === "unauthenticated") {
          logTrace(`saveApplication: User is not authenticated.`);
          context.res = {
            status: 401,
            body: "Cannot save application when not authenticated.",
          };
        } else {
          logError(
            `saveApplication: Unrecognised user service error: ${
              err.error
            } - ${err.arg1?.toString()}`
          );
          context.res = {
            status: 500,
            body: "Unknown user service error",
          };
        }
      } else if (isApplicationServiceError(err)) {
        if (err.error === "version-conflict") {
          logInfo(
            `saveApplication: Version conflict: ${
              err.error
            } - ${err.arg1?.toString()}`
          );
          context.res = {
            status: 409,
            body: "Version conflict. The application you are editing appears to have already been updated.",
          };
        } else {
          logError(
            `saveApplication: Unrecognised application service error: ${
              err.error
            } - ${err.arg1?.toString()}`
          );
          context.res = {
            status: 500,
            body: "Unknown application service error",
          };
        }
      } else {
        logError(`saveApplication: Unknown error: ${err.message}`);
        throw err;
      }
    }
  } else {
    logTrace(`saveApplication: User is not authenticated.`);
    context.res = {
      status: 401,
      body: "Cannot save application when not authenticated.",
    };
  }
};

export default httpTrigger;

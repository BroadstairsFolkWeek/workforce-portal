import { getUserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { sanitiseApplicationFromApiClient } from "../services/application-sanitise";
import {
  isApplicationServiceError,
  saveApplication,
} from "../services/application-service";
import { getUserProfile, isUserServiceError } from "../services/user-service";
import { setLoggerFromContext } from "../utilties/logging";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);

  const userInfo = getUserInfo(req);
  if (userInfo) {
    try {
      const userProfile = await getUserProfile(userInfo);
      if (userProfile) {
        const application = sanitiseApplicationFromApiClient(
          req.body,
          userProfile
        );
        const savedApplication = await saveApplication(
          application,
          userProfile
        );
        context.res = { status: 200, body: savedApplication };
      } else {
        context.res = {
          status: 404,
          body: "User Profile does not exist, cannot save application.",
        };
      }
    } catch (err) {
      if (isUserServiceError(err)) {
        switch (err.error) {
          case "unauthenticated":
            context.res = {
              status: 401,
              body: "Cannot save application when not authenticated.",
            };
            break;
        }
      } else if (isApplicationServiceError(err)) {
        switch (err.error) {
          case "version-conflict":
            context.res = {
              status: 409,
              body: err.arg1,
            };
            break;
        }
      } else {
        throw err;
      }
    }
  } else {
    context.res = {
      status: 401,
      body: "Cannot save application when not authenticated.",
    };
  }
};

export default httpTrigger;

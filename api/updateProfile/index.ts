import { getUserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Profile } from "../interfaces/profile";
import { sanitiseProfileUpdateFromApiClient } from "../services/api-sanitise-service";
import {
  isProfileServiceError,
  updateUserProfile,
} from "../services/profile-service";
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
  logTrace("saveProfile: entry");

  const userInfo = getUserInfo(req);
  if (userInfo) {
    logTrace(
      `saveProfile: User is authenticated. User ID: ${userInfo.userId}/${userInfo.identityProvider}`
    );

    const updatedUserProfile = sanitiseProfileUpdateFromApiClient(req.body);

    try {
      const savedProfile = await updateUserProfile(
        updatedUserProfile,
        userInfo.userId!
      );
      context.res = { status: 200, body: savedProfile };
    } catch (err) {
      if (isProfileServiceError(err)) {
        if (err.error === "missing-user-profile") {
          logError(
            `saveProfile: User profile does not exist for authenticated user. User ID: ${userInfo.userId}/${userInfo.identityProvider}`
          );
          context.res = {
            status: 404,
            body: "User Profile does not exist, cannot update profile.",
          };
        } else if (err.error === "version-conflict") {
          const latestUserProfile: Profile = err.arg1 as Profile;
          logInfo(
            `saveProfile: Version conflict: Attempted to make changes to version ${updatedUserProfile.version} when version ${latestUserProfile.version} already exists.`
          );
          context.res = {
            status: 409,
            body: latestUserProfile,
          };
        } else {
          logError(
            `saveProfile: Unrecognised user service error: ${
              err.error
            } - ${err.arg1?.toString()}`
          );
          context.res = {
            status: 500,
            body: "Unknown user service error",
          };
        }
      } else {
        logError(`saveProfile: Unknown error: ${err}`);
        throw err;
      }
    }
  } else {
    logTrace(`saveProfile: User is not authenticated.`);
    context.res = {
      status: 401,
      body: "Cannot update user profile when not authenticated.",
    };
  }
};

export default httpTrigger;

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserInfo } from "@aaronpowell/static-web-apps-api-auth";
import parseMultipartFormData from "@anzp/azure-function-multipart";
import {
  isUserServiceError,
  setProfilePicture,
} from "../services/user-service";
import {
  logError,
  logTrace,
  logWarn,
  setLoggerFromContext,
} from "../utilties/logging";
import {
  isApiSanitiseServiceError,
  sanitiseImageFromApiClient,
} from "../services/api-sanitise-service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);
  logTrace("profilePhoto: entry");

  if (req.method !== "POST") {
    logTrace(`profilePhoto: Invalid HTTP method: ${req.method}`);
    context.res = {
      status: 405,
      headers: {
        Allow: "POST",
      },
    };
    return;
  }

  const userInfo = getUserInfo(req);

  if (userInfo) {
    logTrace(
      `profilePhoto: User is authenticated. User ID: ${userInfo.userId}/${userInfo.identityProvider}`
    );

    const { files } = await parseMultipartFormData(req);
    if (files.length === 0) {
      logWarn("profilePhoto: No files included in request");
      context.res = {
        status: 400,
        body: "No profile image uploaded",
      };
    } else {
      const imageFile = files[0];
      try {
        const [, fileExtension, fileBuffer] =
          sanitiseImageFromApiClient(imageFile);

        await setProfilePicture(userInfo, fileExtension, fileBuffer);

        context.res = {
          status: 200,
        };
      } catch (err) {
        if (isApiSanitiseServiceError(err) && err.error === "invalid-request") {
          logWarn(
            "profilePhoto: Invalid MIME-type used for profile image: " +
              imageFile.mimeType
          );
          context.res = {
            status: 400,
            body: "Unsupported image file type",
          };
        } else if (
          isUserServiceError(err) &&
          err.error === "profile-photo-already-exists"
        ) {
          context.res = {
            status: 409,
            body: "Profile photo already exists with that name. Please use a different file name.",
          };
        } else {
          logError("profilePhoto: Unknown error: " + err);
          context.res = {
            status: 500,
            body: "Unknown error",
          };
        }
      }
    }
  } else {
    logTrace(`profilePhoto: User is not authenticated.`);
    context.res = {
      status: 401,
      body: "Cannot profile photo when not authenticated.",
    };
  }
};

export default httpTrigger;

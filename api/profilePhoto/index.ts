import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserInfo, UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import parseMultipartFormData from "@anzp/azure-function-multipart";
import {
  getProfilePicture,
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

const handleGetProfilePhoto = async function (
  userInfo: UserInfo,
  index: number
): Promise<Context["res"]> {
  const result = await getProfilePicture(userInfo, index);
  if (result) {
    return {
      status: 200,
      body: new Uint8Array(result.content),
      isRaw: true,
      headers: {
        "Content-Type": result.mimeType,
      },
    };
  } else {
    return {
      status: 404,
    };
  }
};

const handlePostProfilePhoto = async function (
  req: HttpRequest,
  userInfo: UserInfo
): Promise<Context["res"]> {
  const { files } = await parseMultipartFormData(req);
  if (files.length === 0) {
    logWarn("profilePhoto: No files included in request");
    return {
      status: 400,
      body: "No profile image uploaded",
    };
  }

  const imageFile = files[0];
  try {
    const [, fileExtension, fileBuffer] = sanitiseImageFromApiClient(imageFile);
    await setProfilePicture(userInfo, fileExtension, fileBuffer);

    return {
      status: 200,
    };
  } catch (err) {
    if (isApiSanitiseServiceError(err) && err.error === "invalid-request") {
      logWarn(
        "profilePhoto: Invalid MIME-type used for profile image: " +
          imageFile.mimeType
      );
      return {
        status: 400,
        body: "Unsupported image file type",
      };
    } else if (
      isUserServiceError(err) &&
      err.error === "profile-photo-already-exists"
    ) {
      return {
        status: 409,
        body: "Profile photo already exists with that name. Please use a different file name.",
      };
    } else {
      logError("profilePhoto: Unknown error: " + err);
      return {
        status: 500,
        body: "Unknown error",
      };
    }
  }
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  setLoggerFromContext(context);
  logTrace("profilePhoto: entry. Method: " + req.method);

  if (req.method !== "GET" && req.method !== "POST") {
    logTrace(`profilePhoto: Invalid HTTP method: ${req.method}`);
    context.res = {
      status: 405,
      headers: {
        Allow: "GET, POST",
      },
    };
    return;
  }

  const userInfo = getUserInfo(req);

  if (userInfo) {
    logTrace(
      `profilePhoto: User is authenticated. User ID: ${userInfo.userId}/${userInfo.identityProvider}`
    );

    if (req.method === "GET") {
      const indexString = req.query.index ?? "0";
      const index = Number.parseInt(indexString);
      context.res = await handleGetProfilePhoto(userInfo, index);
    } else {
      context.res = await handlePostProfilePhoto(req, userInfo);
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

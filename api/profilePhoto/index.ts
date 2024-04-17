import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserInfo, UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import parseMultipartFormData from "@anzp/azure-function-multipart";
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
import {
  deleteProfilePicture,
  getProfilePicture,
  isProfileServiceError,
  setProfilePicture,
} from "../services/profile-service";
import { isUserServiceError } from "../services/user-service";

const handleGetProfilePhoto = async function (photoId: string) {
  if (photoId) {
    const result = await getProfilePicture(photoId);
    if (result) {
      return {
        status: 200,
        body: new Uint8Array(result.content),
        isRaw: true,
        headers: {
          "Content-Type": result.mimeType,
          "Cache-Control": "public, max-age=604800",
        },
      };
    } else {
      return {
        status: 404,
      };
    }
  } else {
    return {
      status: 400,
      body: "Missing id query parameter",
    };
  }
};

const handlePostProfilePhoto = async function (
  req: HttpRequest,
  userInfo: UserInfo
) {
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

    const updatedProfile = await setProfilePicture(
      userInfo,
      fileExtension,
      fileBuffer
    );

    return {
      status: 200,
      body: updatedProfile,
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
    } else {
      logError("profilePhoto: Unknown error: " + err);
      return {
        status: 500,
        body: "Unknown error",
      };
    }
  }
};

const handleDeleteProfilePhoto = async function (userInfo: UserInfo) {
  try {
    const result = await deleteProfilePicture(userInfo);
    return {
      status: 200,
      body: result,
    };
  } catch (err) {
    if (isProfileServiceError(err)) {
      if (err.error === "missing-user-profile") {
        logTrace(`profilePhoto: User profile does not exist.`);
        return {
          status: 404,
          body: "Cannot delete profile picture. User profile does not exist.",
        };
      } else {
        logTrace(`profilePhoto: Unknown user service error.`);
        return {
          status: 500,
          body: "Unknown user service error.",
        };
      }
    } else if (isUserServiceError(err)) {
      if (err.error === "unauthenticated") {
        logTrace(`profilePhoto: User is not authenticated.`);
        return {
          status: 401,
          body: "Cannot alter profile photo when not authenticated.",
        };
      } else {
        logTrace(`profilePhoto: Unknown user service error.`);
        return {
          status: 500,
          body: "Unknown user service error.",
        };
      }
    } else {
      logTrace(`profilePhoto: Unknown service error.`);
      return {
        status: 500,
        body: "Unknown service error.",
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

  if (
    req.method !== "GET" &&
    req.method !== "POST" &&
    req.method !== "DELETE"
  ) {
    logTrace(`profilePhoto: Invalid HTTP method: ${req.method}`);
    context.res = {
      status: 405,
      headers: {
        Allow: "GET, POST, DELETE",
      },
    };
    return;
  }

  if (req.method === "GET") {
    const id = req.query.id;
    context.res = await handleGetProfilePhoto(id);
  } else {
    const userInfo = getUserInfo(req);
    if (userInfo) {
      logTrace(
        `profilePhoto: User is authenticated. User ID: ${userInfo.userId}/${userInfo.identityProvider}`
      );

      if (req.method === "POST") {
        context.res = await handlePostProfilePhoto(req, userInfo);
      } else {
        context.res = await handleDeleteProfilePhoto(userInfo);
      }
    } else {
      logTrace(`profilePhoto: User is not authenticated.`);
      context.res = {
        status: 401,
        body: "Cannot alter profile photo when not authenticated.",
      };
    }
  }
};

export default httpTrigger;

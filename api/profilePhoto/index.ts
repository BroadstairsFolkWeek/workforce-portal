import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Effect, LogLevel, Logger } from "effect";
import { Schema as S } from "@effect/schema";

import { getUserInfo, UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import parseMultipartFormData from "@anzp/azure-function-multipart";
import {
  createLoggerLayer,
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
import { ApiGetPhotoRequestQuery } from "../api/profile";
import { repositoriesLayerLive } from "../contexts/repositories-live";

const handleGetProfilePhoto = (photoId: string) =>
  getProfilePicture(photoId).pipe(
    Effect.andThen(({ content, mimeType }) => ({
      status: 200 as const,
      body: new Uint8Array(content),
      isRaw: true,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=604800",
      },
    })),
    Effect.catchTag("PhotoNotFound", () =>
      Effect.succeed({ status: 404 as const })
    )
  );

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
      userInfo.userId!,
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
    const result = await deleteProfilePicture(userInfo.userId!);
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
    const getProfilePhotoProgram = Effect.logTrace(`GET profilePhoto: entry.`)
      .pipe(
        Effect.andThen(S.decodeUnknown(ApiGetPhotoRequestQuery)(req.query)),
        Effect.andThen((getPhotoRequest) =>
          handleGetProfilePhoto(getPhotoRequest.id)
        )
      )
      .pipe(
        Effect.catchTag("ParseError", () =>
          Effect.succeed({
            status: 400 as const,
            body: "Invalid request",
          })
        )
      );

    const logLayer = createLoggerLayer(context);

    context.res = await Effect.runPromise(
      getProfilePhotoProgram.pipe(
        Effect.provide(repositoriesLayerLive),
        Logger.withMinimumLogLevel(LogLevel.Debug),
        Effect.provide(logLayer)
      )
    );
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

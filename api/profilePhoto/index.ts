import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Effect, LogLevel, Logger } from "effect";
import { Schema as S } from "@effect/schema";

import { getUserInfo, UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import {
  createLoggerLayer,
  logTrace,
  logWarn,
  setLoggerFromContext,
} from "../utilties/logging";
import {
  getProfilePicture,
  setProfilePicture,
} from "../services/profile-service";
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
  const photoContent = req.bufferBody;
  if (!photoContent) {
    logWarn("profilePhoto: No file content included in request");
    return {
      status: 400,
      body: "No profile image uploaded",
    };
  }

  const contentType = req.headers["content-type"];
  if (!contentType) {
    logWarn("profilePhoto: No content type included in request");
    return {
      status: 400,
      body: "No content type included in request",
    };
  }

  const setProfilePictureProgram = setProfilePicture(
    userInfo.userId!,
    contentType,
    photoContent
  ).pipe(
    Effect.andThen((updatedProfile) =>
      Effect.succeed({
        status: 200,
        body: updatedProfile,
      })
    ),
    Effect.catchTag("ProfileNotFound", () =>
      Effect.succeed({
        status: 404,
      })
    )
  );

  return await Effect.runPromise(
    setProfilePictureProgram.pipe(Effect.provide(repositoriesLayerLive))
  );
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

      context.res = await handlePostProfilePhoto(req, userInfo);
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

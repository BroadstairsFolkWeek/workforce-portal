import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Effect } from "effect";
import { Schema as S } from "@effect/schema";

import { getUserInfo, UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { logTrace, logWarn, setLoggerFromContext } from "../utilties/logging";
import {
  getProfileWithFormsByProfile,
  setProfilePicture,
} from "../services/profile-service";
import { repositoriesLayerLive } from "../contexts/repositories-live";
import { SetProfilePhotoResponse } from "../api/photo";

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
  )
    .pipe(
      Effect.andThen(getProfileWithFormsByProfile(userInfo.userId!)),
      Effect.andThen((data) => ({ data })),
      Effect.andThen(S.encode(SetProfilePhotoResponse)),
      Effect.andThen((body) =>
        Effect.succeed({
          status: 200,
          body,
        })
      )
    )
    .pipe(
      Effect.catchTags({
        ParseError: (e) =>
          Effect.logError(
            `ParseError when setting profile photo for user ${userInfo.userId}`,
            e
          ).pipe(Effect.andThen(Effect.succeed({ status: 500 }))),
      })
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

    context.res = await handlePostProfilePhoto(req, userInfo);
  } else {
    logTrace(`profilePhoto: User is not authenticated.`);
    context.res = {
      status: 401,
      body: "Cannot alter profile photo when not authenticated.",
    };
  }
};

export default httpTrigger;

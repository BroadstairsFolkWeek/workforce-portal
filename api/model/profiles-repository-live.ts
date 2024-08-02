import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";

import {
  ProfileNotFound,
  ProfileVersionMismatch,
  ProfilesRepository,
} from "./profiles-repository";
import { ModelProfile, ModelProfileUpdates } from "./interfaces/profile";
import { WfApiClient } from "../wf-api/wf-client";
import { ModelUser } from "./interfaces/user";

const ProfileAndUser = Schema.Struct({
  profile: ModelProfile,
  user: ModelUser,
});

const GetUserAndProfileApiResponseSchema = Schema.Struct({
  data: ProfileAndUser,
});

const ProfileUpdateApiResponseSchema = Schema.Struct({
  data: ModelProfile,
});

const modelGetProfileByUserId = (userId: string) =>
  WfApiClient.pipe(
    Effect.andThen((apiClient) => apiClient.getJson(`/api/users/${userId}`)),
    Effect.andThen(Schema.decodeUnknown(GetUserAndProfileApiResponseSchema)),
    Effect.andThen((response) => response.data),
    Effect.andThen((userAndProfile) => userAndProfile.profile)
  ).pipe(
    Effect.catchTags({
      RequestError: (e) => Effect.die("Failed to get profile by user id: " + e),
      ResponseError: (e) => {
        switch (e.response.status) {
          case 404:
            return Effect.fail(new ProfileNotFound());
          default:
            return Effect.die("Failed to get profile by user id: " + e);
        }
      },
      // Parse errors of data from the WF API are considered unrecoverable.
      ParseError: (e) => Effect.die(e),
    })
  );

const modelUpdateProfileByUserId = (
  userId: string,
  version: number,
  updates: ModelProfileUpdates
) =>
  WfApiClient.pipe(
    Effect.andThen((apiClient) =>
      apiClient.patchJsonDataJsonResponse(
        `/api/users/${userId}/profile/properties`
      )({
        version,
        updates,
      })
    ),
    Effect.andThen(Schema.decodeUnknown(ProfileUpdateApiResponseSchema)),
    Effect.andThen((response) => response.data)
  ).pipe(
    Effect.catchTags({
      RequestError: (e) => Effect.die("Failed to get profile by user id: " + e),

      ResponseError: (e) => {
        switch (e.response.status) {
          case 404:
            return Effect.fail(new ProfileNotFound());
          case 409:
            return Effect.fail(new ProfileVersionMismatch());
          default:
            return Effect.die("Failed to get profile by user id: " + e);
        }
      },

      HttpBodyError: (e) => Effect.die("Failed to set profile photo: " + e),

      // Parse errors of data from the WF API are considered unrecoverable.
      ParseError: (e) => Effect.die(e),
    })
  );

const modelCreateProfileForUser = (user: ModelUser) => {
  return WfApiClient.pipe(
    Effect.andThen((apiClient) =>
      apiClient.putJsonDataJsonResponse(`/api/users/${user.id}/properties`)(
        user
      )
    ),
    Effect.andThen(Schema.decodeUnknown(GetUserAndProfileApiResponseSchema)),
    Effect.andThen((response) => response.data.profile)
  ).pipe(
    Effect.catchTags({
      RequestError: (e) =>
        Effect.die("Failed to create profile for user: " + e),
      ResponseError: (e) =>
        Effect.die("Failed to create profile for user: " + e),
      HttpBodyError: (e) =>
        Effect.die("Failed to create profile for user: " + e),

      // Parse errors of data from the WF API are considered unrecoverable.
      ParseError: (e) => Effect.die(e),
    })
  );
};

const prepareProfilePhotoData = (fileMimeType: string, fileBuffer: Buffer) => ({
  contentBase64: fileBuffer.toString("base64"),
  contentMimeType: fileMimeType,
});

const modelSetProfilePhoto = (
  userId: string,
  fileMimeType: string,
  fileBuffer: Buffer
) => {
  return WfApiClient.pipe(
    Effect.andThen((apiClient) =>
      apiClient.putJsonDataJsonResponse(`/api/users/${userId}/profile/photo`)(
        prepareProfilePhotoData(fileMimeType, fileBuffer)
      )
    ),
    Effect.andThen(Schema.decodeUnknown(ProfileUpdateApiResponseSchema)),
    Effect.andThen((response) => response.data)
  ).pipe(
    // Parse errors of data from Graph/SharePoint are considered unrecoverable.
    Effect.catchTag("ParseError", (e) => Effect.die(e)),

    Effect.catchTag("RequestError", (e) =>
      Effect.die("Failed to set profile photo: " + e)
    ),
    Effect.catchTag("ResponseError", (e) =>
      Effect.die("Failed to set profile photo: " + e)
    ),
    Effect.catchTag("HttpBodyError", (e) =>
      Effect.die("Failed to set profile photo: " + e)
    )
  );
};

const deleteProfileByUserId = (userId: string) => {
  return WfApiClient.pipe(
    Effect.andThen((apiClient) =>
      apiClient.deleteJsonResponse(`/api/users/${userId}`)
    )
  ).pipe(
    Effect.catchTags({
      RequestError: (e) =>
        Effect.die("Failed to delete profile for user login: " + e),
      ResponseError: (e) =>
        Effect.die("Failed to delete profile for user login: " + e),
    })
  );
};

export const profilesRepositoryLive = Layer.effect(
  ProfilesRepository,
  Effect.all([WfApiClient]).pipe(
    Effect.andThen(([wfApiClient]) => ({
      modelGetProfileByUserId: (userId: string) =>
        modelGetProfileByUserId(userId).pipe(
          Effect.provideService(WfApiClient, wfApiClient)
        ),

      modelUpdateProfileByUserId: (
        userId: string,
        version: number,
        updates: ModelProfileUpdates
      ) =>
        modelUpdateProfileByUserId(userId, version, updates).pipe(
          Effect.provideService(WfApiClient, wfApiClient)
        ),

      modelCreateProfileForUser: (user: ModelUser) =>
        modelCreateProfileForUser(user).pipe(
          Effect.provideService(WfApiClient, wfApiClient)
        ),

      modelSetProfilePhoto: (
        userId: string,
        fileMimeType: string,
        fileBuffer: Buffer
      ) =>
        modelSetProfilePhoto(userId, fileMimeType, fileBuffer).pipe(
          Effect.provideService(WfApiClient, wfApiClient)
        ),

      modelDeleteProfileByUserId: (userId: string) =>
        deleteProfileByUserId(userId).pipe(
          Effect.provideService(WfApiClient, wfApiClient)
        ),
    }))
  )
);

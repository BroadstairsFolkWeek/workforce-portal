import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";

import {
  ProfileNotFound,
  ProfileVersionMismatch,
  ProfilesRepository,
} from "./profiles-repository";
import { ProfilesGraphListAccess } from "./graph/profiles-graph-list-access";
import {
  ModelAddableProfile,
  ModelPersistedProfile,
  ModelProfile,
  ModelProfileUpdates,
} from "./interfaces/profile";
import {
  PersistedGraphListItem,
  PersistedGraphListItemFields,
} from "./interfaces/graph/graph-items";
import { WfApiClient } from "../wf-api/wf-client";

const fieldsToProfile = (fields: PersistedGraphListItemFields) =>
  Schema.decodeUnknown(ModelPersistedProfile)(fields);

const graphListItemToProfile = (
  item: PersistedGraphListItem<PersistedGraphListItemFields>
) => {
  return fieldsToProfile(item.fields);
};

const SingleProfileApiResponseSchema = Schema.Struct({
  data: ModelProfile,
});

const modelGetProfileByUserId = (userId: string) =>
  WfApiClient.pipe(
    Effect.andThen((apiClient) =>
      apiClient.getJson(`/api/users/${userId}/profile`)
    ),
    Effect.andThen(Schema.decodeUnknown(SingleProfileApiResponseSchema)),
    Effect.andThen((response) => response.data)
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
      apiClient.patchJsonDataJsonResponse(`/api/users/${userId}/profile`)({
        version,
        updates,
      })
    ),
    Effect.andThen(Schema.decodeUnknown(SingleProfileApiResponseSchema)),
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

const modelCreateProfile = (addableProfile: ModelAddableProfile) => {
  return ProfilesGraphListAccess.pipe(
    Effect.andThen((listAccess) =>
      Schema.encode(ModelAddableProfile)(addableProfile).pipe(
        Effect.andThen(listAccess.createProfileGraphListItem)
      )
    ),
    Effect.andThen(graphListItemToProfile),
    // Parse errors of data from Graph/SharePoint are considered unrecoverable.
    Effect.catchTag("ParseError", (e) => Effect.die(e))
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
    Effect.andThen(Schema.decodeUnknown(SingleProfileApiResponseSchema)),
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

export const profilesRepositoryLive = Layer.effect(
  ProfilesRepository,
  Effect.all([ProfilesGraphListAccess, WfApiClient]).pipe(
    Effect.andThen(([service, wfApiClient]) => ({
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

      modelCreateProfile: (addableProfile: ModelAddableProfile) =>
        modelCreateProfile(addableProfile).pipe(
          Effect.provideService(ProfilesGraphListAccess, service)
        ),

      modelSetProfilePhoto: (
        userId: string,
        fileMimeType: string,
        fileBuffer: Buffer
      ) =>
        modelSetProfilePhoto(userId, fileMimeType, fileBuffer).pipe(
          Effect.provideService(WfApiClient, wfApiClient)
        ),
    }))
  )
);

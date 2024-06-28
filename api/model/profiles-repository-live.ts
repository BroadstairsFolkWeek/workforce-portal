import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";

import { ProfileNotFound, ProfilesRepository } from "./profiles-repository";
import { ProfilesGraphListAccess } from "./graph/profiles-graph-list-access";
import {
  ModelAddableProfile,
  ModelPersistedProfile,
  ModelProfile,
  ModelProfileId,
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

const apiSingResponseJsonToProfile = (responseJson: unknown) =>
  Schema.decodeUnknown(ModelProfile)(responseJson);

const modelGetProfileByUserId = (userId: string) =>
  WfApiClient.pipe(
    Effect.andThen((apiClient) =>
      apiClient.getJson(`/api/users/${userId}/profile`)
    ),
    Effect.andThen(apiSingResponseJsonToProfile)
  ).pipe(
    Effect.catchTag("RequestError", (e) =>
      Effect.die("Failed to get profile by user id: " + e)
    ),
    Effect.catchTag("ResponseError", (e) =>
      e.response.status === 404
        ? Effect.fail(new ProfileNotFound())
        : Effect.die("Failed to get profile by user id: " + e)
    ),
    // Parse errors of data from the WF API are considered unrecoverable.
    Effect.catchTag("ParseError", (e) => Effect.die(e))
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
  profileId: ModelProfileId,
  fileMimeType: string,
  fileBuffer: Buffer
) => {
  return WfApiClient.pipe(
    Effect.andThen((apiClient) =>
      apiClient.putJsonDataJsonResponse(`/api/profiles/${profileId}/photo`)(
        prepareProfilePhotoData(fileMimeType, fileBuffer)
      )
    ),
    Effect.andThen(apiSingResponseJsonToProfile)
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

      modelCreateProfile: (addableProfile: ModelAddableProfile) =>
        modelCreateProfile(addableProfile).pipe(
          Effect.provideService(ProfilesGraphListAccess, service)
        ),

      modelSetProfilePhoto: (
        profileId: ModelProfileId,
        fileMimeType: string,
        fileBuffer: Buffer
      ) =>
        modelSetProfilePhoto(profileId, fileMimeType, fileBuffer).pipe(
          Effect.provideService(WfApiClient, wfApiClient)
        ),
    }))
  )
);

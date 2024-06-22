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

const apiResponseJsonToProfiles = (responseJson: unknown) =>
  Schema.decodeUnknown(Schema.Array(ModelProfile))(responseJson);

const modelGetProfileByFilter = (filter: string) => {
  return ProfilesGraphListAccess.pipe(
    Effect.flatMap((listAccess) =>
      listAccess.getProfileGraphListItemsByFilter(filter)
    ),
    Effect.head,
    Effect.catchTag("NoSuchElementException", () =>
      Effect.fail(new ProfileNotFound())
    ),
    Effect.flatMap((item) => graphListItemToProfile(item)),
    // Parse errors of data from Graph/SharePoint are considered unrecoverable.
    Effect.catchTag("ParseError", (e) => Effect.die(e))
  );
};

const modelGetProfileByProfileId = (profileId: ModelProfileId) => {
  return modelGetProfileByFilter(`fields/ProfileId eq '${profileId}'`);
};

const parseProfilesResponse = (
  responseAsJson: unknown
): Effect.Effect<readonly ModelProfile[]> =>
  apiResponseJsonToProfiles(responseAsJson).pipe(
    // Parse errors of data from the WF API are considered unrecoverable.
    Effect.catchTag("ParseError", (e) => Effect.die(e))
  );

const parseProfilesResponseForSingleProfile = (responseJson: unknown) =>
  parseProfilesResponse(responseJson).pipe(
    Effect.head,
    Effect.catchTag("NoSuchElementException", () =>
      Effect.fail(new ProfileNotFound())
    )
  );

const modelGetProfileByUserId = (userId: string) =>
  WfApiClient.pipe(
    Effect.andThen((apiClient) =>
      apiClient.getJson("/api/profiles", `userId=${userId}`)
    ),
    Effect.andThen(parseProfilesResponseForSingleProfile)
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

      modelGetProfileByProfileId: (profileId: ModelProfileId) =>
        modelGetProfileByProfileId(profileId).pipe(
          Effect.provideService(ProfilesGraphListAccess, service)
        ),
    }))
  )
);

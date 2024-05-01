import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";
import { ProfileNotFound, ProfilesRepository } from "./profiles-repository";
import { ProfilesGraphListAccess } from "./graph/profiles-graph-list-access";
import {
  ModelAddableProfile,
  ModelPersistedProfile,
  ModelProfileId,
} from "./interfaces/profile";

const graphListItemToProfile = (item: any) => {
  return Schema.decode(ModelPersistedProfile)(item.fields);
};

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
  ProfilesGraphListAccess.pipe(
    Effect.map((service) => ({
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

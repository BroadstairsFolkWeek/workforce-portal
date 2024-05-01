import { Schema as S } from "@effect/schema";

import { Effect, Layer } from "effect";
import {
  ModelAddableProfile,
  ModelPersistedProfile,
  ModelProfileId,
} from "../../model/interfaces/profile";
import { ProfilesGraphListAccess } from "../../model/graph/profiles-graph-list-access";
import { ProfilesRepository } from "../../model/profiles-repository";
import { profilesRepositoryLive } from "../../model/profiles-repository-graph";

const sharepointItemFields = {
  id: "1",
  Created: "2021-01-01T00:00:00Z",
  Modified: "2021-02-03T04:05:06Z",
  Title: "DisplayName",
  GivenName: "GivenName",
  Surname: "Surname",
  Email: "Email",
  Telephone: "Telephone",
  Addresss: "Address",
  ProfileId: "ProfileId",
  PhotoIds:
    "cd75d654-6e8c-4d3f-9144-cc98cb72474d:dabf5573-56e1-43f1-86ce-92edc89cc78c",
  Version: 2,
};

const modelAddableItemFields = {
  displayName: "DisplayName",
  givenName: "GivenName",
  surname: "Surname",
  email: "Email",
  telephone: "Telephone",
  address: "Address",
  profileId: S.decodeSync(ModelProfileId)("ProfileId"),
  photoIds: [
    "cd75d654-6e8c-4d3f-9144-cc98cb72474d:dabf5573-56e1-43f1-86ce-92edc89cc78c",
  ],
  version: 2,
};

const modelPersistedItemFields = {
  ...modelAddableItemFields,
  dbId: 1,
  createdDate: new Date("2021-01-01T00:00:00Z"),
  modifiedDate: new Date("2021-02-03T04:05:06Z"),
};

const mockLayers = Layer.succeed(ProfilesGraphListAccess, {
  createProfileGraphListItem: (fields) =>
    Effect.succeed({
      fields: {
        id: "1",
        Created: "2021-01-01T00:00:00Z",
        Modified: "2021-02-03T04:05:06Z",
        Title: fields.Title,
        GivenName: fields.GivenName,
        Surname: fields.Surname,
        Email: fields.Email,
        Telephone: fields.Telephone,
        Address: fields.Address,
        PhotoIds: fields.PhotoIds,
        Version: fields.Version,
        ProfileId: fields.ProfileId,
      },
    }),
  getProfileGraphListItemsByFilter: () =>
    Effect.succeed([{ fields: sharepointItemFields }]),
});

test("modelCreateProfile returns a ModelPersistedProfile", () => {
  const input: ModelAddableProfile = {
    ...modelAddableItemFields,
  };
  const expected: ModelPersistedProfile = {
    ...modelPersistedItemFields,
  };

  const program = ProfilesRepository.pipe(
    Effect.andThen((repo) => repo.modelCreateProfile(input)),
    Effect.provide(profilesRepositoryLive)
  );

  const runnable = Effect.provide(program, mockLayers);

  const actual = Effect.runSync(runnable);

  expect(actual).toStrictEqual(expected);
});

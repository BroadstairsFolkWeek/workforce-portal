import { Schema as S } from "@effect/schema";

import { Effect, Layer } from "effect";
import {
  ModelAddableProfile,
  ModelEncodedAddableProfile,
  ModelPersistedProfile,
  ModelProfile,
  ModelProfileId,
} from "../../model/interfaces/profile";
import { ProfilesGraphListAccess } from "../../model/graph/profiles-graph-list-access";
import { ProfilesRepository } from "../../model/profiles-repository";
import { profilesRepositoryLive } from "../../model/profiles-repository-live";
import { WfApiClient } from "../../wf-api/wf-client";

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
    "cd75d654-6e8c-4d3f-9144-cc98cb72474d:dabf5573-56e1-43f1-86ce-92edc89cc78c\n5b2f278c-4233-4ae3-ac3f-5a577960145b:078c6b36-0779-452e-9f00-3973b0d7fda4",
  Version: 2,
};

const wfGetProfileResponse = [
  {
    displayName: "DisplayName",
    givenName: "GivenName",
    surname: "Surname",
    email: "Email",
    telephone: "Telephone",
    address: "Address",
    profileId: "ProfileId",
    photoUrl: "PHOTO_URL",
    version: 2,
  },
];

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
    "5b2f278c-4233-4ae3-ac3f-5a577960145b:078c6b36-0779-452e-9f00-3973b0d7fda4",
  ],
  version: 2,
};

const modelPersistedItemFields = {
  ...modelAddableItemFields,
  dbId: 1,
  createdDate: new Date("2021-01-01T00:00:00Z"),
  modifiedDate: new Date("2021-02-03T04:05:06Z"),
};

const mockCreateProfileGraphListItem = jest.fn(
  (fields: ModelEncodedAddableProfile) =>
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
    })
);

const mockGetProfileGraphListItemsByFilter = jest.fn(() =>
  Effect.succeed([{ fields: sharepointItemFields }])
);

const mockGetJson = jest.fn(() => Effect.succeed(wfGetProfileResponse));

const mockLayers = Layer.merge(
  Layer.succeed(ProfilesGraphListAccess, {
    createProfileGraphListItem: mockCreateProfileGraphListItem,
    getProfileGraphListItemsByFilter: mockGetProfileGraphListItemsByFilter,
  }),
  Layer.succeed(WfApiClient, {
    getJson: mockGetJson,
  })
);

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
  expect(mockCreateProfileGraphListItem.mock.calls).toHaveLength(1);
  const [inputToMock] = mockCreateProfileGraphListItem.mock.calls[0];
  expect(inputToMock.PhotoIds).toEqual(sharepointItemFields.PhotoIds);
});

test("modelGetProfileByUserId returns a ModelProfile", () => {
  const expected: ModelProfile = {
    displayName: "DisplayName",
    givenName: "GivenName",
    surname: "Surname",
    email: "Email",
    telephone: "Telephone",
    address: "Address",
    profileId: ModelProfileId.make("ProfileId"),
    photoUrl: "PHOTO_URL",
    version: 2,
  };

  const program = ProfilesRepository.pipe(
    Effect.andThen((repo) => repo.modelGetProfileByUserId("USERID")),
    Effect.provide(profilesRepositoryLive)
  );

  const runnable = Effect.provide(program, mockLayers);

  const actual = Effect.runSync(runnable);

  expect(actual).toStrictEqual(expected);
});

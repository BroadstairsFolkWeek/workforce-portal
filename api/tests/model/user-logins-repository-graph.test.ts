import { Schema as S } from "@effect/schema";

import { Effect, Layer } from "effect";
import {
  ModelAddableUserLogin,
  ModelPersistedUserLogin,
} from "../../model/interfaces/user-login";
import { ModelProfileId } from "../../model/interfaces/profile";
import { userLoginRepositoryLive } from "../../model/user-logins-repository-graph";
import { UserLoginRepository } from "../../model/user-logins-repository";
import { UserLoginsGraphListAccess } from "../../model/graph/user-logins-graph-list-access";

const sharepointItemFields = {
  id: "1",
  Created: "2021-01-01T00:00:00Z",
  Modified: "2021-02-03T04:05:06Z",
  Title: "DisplayName",
  IdentityProvider: "IdentityProvider",
  IdentityProviderUserId: "IdentityProviderUserId",
  IdentityProviderUserDetails: "IdentityProviderUserDetails",
  GivenName: "GivenName",
  Surname: "Surname",
  Email: "Email",
  ProfileId: "ProfileId",
};

const modelAddableItemFields = {
  displayName: "DisplayName",
  identityProvider: "IdentityProvider",
  identityProviderUserId: "IdentityProviderUserId",
  identityProviderUserDetails: "IdentityProviderUserDetails",
  givenName: "GivenName",
  surname: "Surname",
  email: "Email",
  profileId: S.decodeSync(ModelProfileId)("ProfileId"),
};

const modelPersistedItemFields = {
  ...modelAddableItemFields,
  dbId: 1,
  createdDate: new Date("2021-01-01T00:00:00Z"),
  modifiedDate: new Date("2021-02-03T04:05:06Z"),
};

const mockLayers = Layer.succeed(UserLoginsGraphListAccess, {
  createUserLoginGraphListItem: (fields) =>
    Effect.succeed({
      fields: {
        id: "1",
        Created: "2021-01-01T00:00:00Z",
        Modified: "2021-02-03T04:05:06Z",
        Title: fields.Title,
        IdentityProvider: fields.IdentityProvider,
        IdentityProviderUserId: fields.IdentityProviderUserId,
        IdentityProviderUserDetails: fields.IdentityProviderUserDetails,
        GivenName: fields.GivenName,
        Surname: fields.Surname,
        Email: fields.Email,
        ProfileId: fields.ProfileId,
      },
    }),
  getUserLoginGraphListItemsByFilter: () =>
    Effect.succeed([{ fields: sharepointItemFields }]),
});

test("modelGetUserLoginByIdentityProviderUserId returns a ModelPersistedUserLogin", () => {
  const expected: ModelPersistedUserLogin = {
    ...modelPersistedItemFields,
  };

  const program = UserLoginRepository.pipe(
    Effect.andThen((repo) =>
      repo.modelGetUserLoginByIdentityProviderUserId("UserId")
    ),
    Effect.provide(userLoginRepositoryLive)
  );

  const runnable = Effect.provide(program, mockLayers);

  const actual = Effect.runSync(runnable);

  expect(actual).toStrictEqual(expected);
});

test("modelCreateUserLogin returns a ModelPersistedUserLogin", () => {
  const input: ModelAddableUserLogin = {
    ...modelAddableItemFields,
  };
  const expected: ModelPersistedUserLogin = {
    ...modelPersistedItemFields,
  };

  const program = UserLoginRepository.pipe(
    Effect.andThen((repo) => repo.modelCreateUserLogin(input)),
    Effect.provide(userLoginRepositoryLive)
  );

  const runnable = Effect.provide(program, mockLayers);

  const actual = Effect.runSync(runnable);

  expect(actual).toStrictEqual(expected);
});

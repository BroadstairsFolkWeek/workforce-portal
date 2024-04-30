import { Schema as S } from "@effect/schema";
import { ModelProfileId } from "./profile";

const ModelCoreUserLogin = S.Struct({
  displayName: S.propertySignature(S.String).pipe(S.fromKey("Title")),
  givenName: S.optional(S.String).pipe(S.fromKey("GivenName")),
  surname: S.optional(S.String).pipe(S.fromKey("Surname")),
  email: S.optional(S.String).pipe(S.fromKey("Email")),
  identityProvider: S.propertySignature(S.String).pipe(
    S.fromKey("IdentityProvider")
  ),
  identityProviderUserId: S.propertySignature(S.String).pipe(
    S.fromKey("IdentityProviderUserId")
  ),
  identityProviderUserDetails: S.propertySignature(S.String).pipe(
    S.fromKey("IdentityProviderUserDetails")
  ),
});

const ModelUserLoginMetadata = S.Struct({
  profileId: S.propertySignature(ModelProfileId).pipe(S.fromKey("ProfileId")),
});

const ModelUserLoginPersistanceData = S.Struct({
  dbId: S.propertySignature(S.NumberFromString).pipe(S.fromKey("id")),
  createdDate: S.propertySignature(S.DateFromString).pipe(S.fromKey("Created")),
  modifiedDate: S.propertySignature(S.DateFromString).pipe(
    S.fromKey("Modified")
  ),
});

export const ModelAddableUserLogin = S.extend(
  ModelCoreUserLogin,
  ModelUserLoginMetadata
);

export const ModelPersistedUserLogin = S.extend(
  ModelCoreUserLogin,
  S.extend(ModelUserLoginMetadata, ModelUserLoginPersistanceData)
);

export interface ModelPersistedUserLogin
  extends S.Schema.Type<typeof ModelPersistedUserLogin> {}

export interface ModelAddableUserLogin
  extends S.Schema.Type<typeof ModelAddableUserLogin> {}

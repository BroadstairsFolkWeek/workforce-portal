import { Schema as S } from "@effect/schema";

const ModelCoreGraphUserIdentity = S.Struct({
  signInType: S.String,
  issuer: S.String,
  issuerAssignedId: S.String,
});

const ModelCoreGraphUser = S.Struct({
  displayName: S.String,
  userPrincipalName: S.String,
  identities: S.Array(ModelCoreGraphUserIdentity),
});

const ModelGraphUserPersistanceData = S.Struct({
  id: S.String,
});

export const ModelGraphUser = S.extend(
  ModelCoreGraphUser,
  ModelGraphUserPersistanceData
);

export interface ModelGraphUser extends S.Schema.Type<typeof ModelGraphUser> {}

import { Schema as S } from "@effect/schema";

export const ModelCoreUserLogin = S.Struct({
  displayName: S.propertySignature(S.String).pipe(S.fromKey("Title")),
  givenName: S.optional(S.String).pipe(S.fromKey("GivenName")),
  surname: S.optional(S.String).pipe(S.fromKey("Surname")),
  email: S.optional(S.String).pipe(S.fromKey("Email")),
  userId: S.propertySignature(S.String).pipe(
    S.fromKey("IdentityProviderUserId")
  ),
});
export interface ModelCoreUserLogin
  extends S.Schema.Type<typeof ModelCoreUserLogin> {}

import { Schema as S } from "@effect/schema";

export const ModelUser = S.Struct({
  userId: S.String,
  displayName: S.String,
  givenName: S.optional(S.String),
  surname: S.optional(S.String),
  email: S.optional(S.String),
});
export interface ModelUser extends S.Schema.Type<typeof ModelUser> {}

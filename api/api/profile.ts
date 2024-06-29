import { Schema as S } from "@effect/schema";

export const ApiGetPhotoRequestQuery = S.Struct({
  id: S.String,
});

export interface ApiGetPhotoRequestQuery
  extends S.Schema.Type<typeof ApiGetPhotoRequestQuery> {}

export const ApiProfileUpdateRequest = S.Struct({
  version: S.Number,
  updates: S.Struct({
    displayName: S.optional(S.String),
    givenName: S.optional(S.String),
    surname: S.optional(S.String),
    address: S.optional(S.String),
    telephone: S.optional(S.String),
    email: S.optional(S.String),
  }),
});

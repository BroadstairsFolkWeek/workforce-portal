import { Schema as S } from "@effect/schema";

export const ModelProfileId = S.String.pipe(S.brand("ProfileId"));
export type ModelProfileId = S.Schema.Type<typeof ModelProfileId>;

export const Profile = S.Struct({
  displayName: S.String,
  givenName: S.optional(S.String),
  surname: S.optional(S.String),
  address: S.optional(S.String),
  telephone: S.optional(S.String),
  metadata: S.Struct({
    photoRequired: S.Boolean,
    profileInformationRequired: S.Boolean,
    version: S.Number,
    photoUrl: S.optional(S.String),
    photoThumbnailUrl: S.optional(S.String),
  }),
});

export interface Profile extends S.Schema.Type<typeof Profile> {}

export const ProfileUpdate = Profile.pipe(
  S.pick("displayName", "givenName", "surname", "telephone", "address")
);
export interface ProfileUpdate extends S.Schema.Type<typeof ProfileUpdate> {}

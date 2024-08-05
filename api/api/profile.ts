import { Schema as S } from "@effect/schema";
import { Template, Form } from "../model/interfaces/form";

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

const ApiProfileMeta = S.Struct({
  photoRequired: S.Boolean,
  profileInformationRequired: S.Boolean,
});

export const ApiProfile = S.Struct({
  version: S.Number,
  displayName: S.String,
  email: S.String,
  givenName: S.optional(S.String),
  surname: S.optional(S.String),
  address: S.optional(S.String),
  telephone: S.optional(S.String),
  photoUrl: S.optional(S.String),
  photoThumbnailUrl: S.optional(S.String),
  meta: ApiProfileMeta,
});

export const ApiProfileWithForms = S.Struct({
  profile: ApiProfile,
  forms: S.Array(Form),
  creatableForms: S.Array(Template),
});

export const GetProfileResponse = S.Struct({
  data: ApiProfileWithForms,
});

export const UpdateProfileResponse = S.Struct({
  data: ApiProfileWithForms,
});

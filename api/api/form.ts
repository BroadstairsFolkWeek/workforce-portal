import { Schema as S } from "@effect/schema";
import { Template, Form } from "../model/interfaces/form";

export const PutProfileResponse = S.Struct({
  data: Form,
});

export const PostFormSubmissionActionResponse = S.Struct({
  data: Form,
});

export const PostNewFormRequestBody = S.Struct({
  answers: S.Unknown,
});

export const PostNewFormResponseBody = S.Struct({
  data: S.Struct({
    form: Form,
    creatableForms: S.Array(Template),
  }),
});

export const DeleteFormResponseBody = S.Struct({
  data: S.Struct({
    creatableForms: S.Array(Template),
  }),
});

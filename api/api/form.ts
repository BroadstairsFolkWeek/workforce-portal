import { Schema as S } from "@effect/schema";
import {
  FormSpec,
  FormSubmissionWithSpecAndActions,
} from "../model/interfaces/form";

export const PutProfileResponse = S.Struct({
  data: FormSubmissionWithSpecAndActions,
});

export const PostFormSubmissionActionResponse = S.Struct({
  data: FormSubmissionWithSpecAndActions,
});

export const PostNewFormRequestBody = S.Struct({
  answers: S.Unknown,
});

export const PostNewFormResponseBody = S.Struct({
  data: S.Struct({
    form: FormSubmissionWithSpecAndActions,
    creatableForms: S.Array(FormSpec),
  }),
});

export const DeleteFormResponseBody = S.Struct({
  data: S.Struct({
    creatableForms: S.Array(FormSpec),
  }),
});

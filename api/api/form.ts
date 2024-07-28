import { Schema as S } from "@effect/schema";
import {
  Template,
  FormSubmissionWithTemplateAndActions,
} from "../model/interfaces/form";

export const PutProfileResponse = S.Struct({
  data: FormSubmissionWithTemplateAndActions,
});

export const PostFormSubmissionActionResponse = S.Struct({
  data: FormSubmissionWithTemplateAndActions,
});

export const PostNewFormRequestBody = S.Struct({
  answers: S.Unknown,
});

export const PostNewFormResponseBody = S.Struct({
  data: S.Struct({
    form: FormSubmissionWithTemplateAndActions,
    creatableForms: S.Array(Template),
  }),
});

export const DeleteFormResponseBody = S.Struct({
  data: S.Struct({
    creatableForms: S.Array(Template),
  }),
});

import { Schema as S } from "@effect/schema";
import { FormSpec, FormSubmission } from "../../interfaces/form";

export const SaveFormResponse = S.Struct({
  data: FormSubmission,
});

export const ActionFormResponse = S.Struct({
  data: FormSubmission,
});

export const CreateFormResponse = S.Struct({
  data: S.Struct({
    form: FormSubmission,
    creatableForms: S.Array(FormSpec),
  }),
});

export const DeleteFormResponse = S.Struct({
  data: S.Struct({
    creatableForms: S.Array(FormSpec),
  }),
});

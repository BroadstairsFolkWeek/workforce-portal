import { Schema as S } from "@effect/schema";
import { Template, Form } from "../../interfaces/form";

export const SaveFormResponse = S.Struct({
  data: Form,
});

export const ActionFormResponse = S.Struct({
  data: Form,
});

export const CreateFormResponse = S.Struct({
  data: S.Struct({
    form: Form,
    creatableForms: S.Array(Template),
  }),
});

export const DeleteFormResponse = S.Struct({
  data: S.Struct({
    creatableForms: S.Array(Template),
  }),
});

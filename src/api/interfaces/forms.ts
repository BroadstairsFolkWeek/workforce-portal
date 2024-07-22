import { Schema as S } from "@effect/schema";
import { FormSubmission } from "../../interfaces/form";

export const SaveApplicationResponse = S.Unknown;

export const SaveFormResponse = S.Struct({
  data: FormSubmission,
});

export const ActionFormResponse = S.Struct({
  data: FormSubmission,
});

import { Schema as S } from "@effect/schema";
import { FormSubmissionWithSpecAndActions } from "../model/interfaces/form";

export const PutProfileResponse = S.Struct({
  data: FormSubmissionWithSpecAndActions,
});

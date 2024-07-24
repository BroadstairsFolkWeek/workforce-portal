import { Schema as S } from "@effect/schema";
import { Profile } from "../../interfaces/profile";
import { FormSpec, FormSubmission } from "../../interfaces/form";

export const ApiProfile = S.Struct({
  profile: Profile,
  forms: S.Array(FormSubmission),
  creatableForms: S.Array(FormSpec),
});

export const GetProfileResponse = S.Struct({
  data: ApiProfile,
});

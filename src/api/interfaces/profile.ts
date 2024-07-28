import { Schema as S } from "@effect/schema";
import { Profile } from "../../interfaces/profile";
import { Template, FormSubmission } from "../../interfaces/form";

export const ApiProfile = S.Struct({
  profile: Profile,
  forms: S.Array(FormSubmission),
  creatableForms: S.Array(Template),
});

export const GetProfileResponse = S.Struct({
  data: ApiProfile,
});

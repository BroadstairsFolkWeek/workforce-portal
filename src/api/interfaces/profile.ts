import { Schema as S } from "@effect/schema";
import { Profile } from "../../interfaces/profile";
import { FormSubmission } from "../../interfaces/form";

export const ApiProfile = S.Struct({
  profile: Profile,
  application: S.optional(S.Unknown),
  forms: S.Array(FormSubmission),
});

export const GetProfileResponse = S.Struct({
  data: ApiProfile,
});

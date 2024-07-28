import { Schema as S } from "@effect/schema";
import { Profile } from "../../interfaces/profile";
import { Template, Form } from "../../interfaces/form";

export const ApiProfile = S.Struct({
  profile: Profile,
  forms: S.Array(Form),
  creatableForms: S.Array(Template),
});

export const GetProfileResponse = S.Struct({
  data: ApiProfile,
});

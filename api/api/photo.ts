import { Schema as S } from "@effect/schema";
import { ApiProfileWithForms } from "./profile";

export const SetProfilePhotoResponse = S.Struct({
  data: ApiProfileWithForms,
});

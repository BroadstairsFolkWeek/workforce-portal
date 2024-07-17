import { Schema as S } from "@effect/schema";
import { ApiProfile } from "./profile";

export const UploadPhotoResponse = S.Struct({
  data: ApiProfile,
});

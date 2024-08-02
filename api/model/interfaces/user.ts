import { Schema as S } from "@effect/schema";

export const ModelUser = S.Struct({
  id: S.String,
  displayName: S.String,
  email: S.String,
});
export interface ModelUser extends S.Schema.Type<typeof ModelUser> {}

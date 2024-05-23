import { Schema as S } from "@effect/schema";

export const ApiGetPhotoRequestQuery = S.Struct({
  id: S.String,
});

export interface ApiGetPhotoRequestQuery
  extends S.Schema.Type<typeof ApiGetPhotoRequestQuery> {}

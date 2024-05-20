import { Schema as S } from "@effect/schema";

export const ApiDeleteApplicationRequestBody = S.Struct({
  version: S.Number,
});

export interface ApiDeleteApplicationRequestBody
  extends S.Schema.Type<typeof ApiDeleteApplicationRequestBody> {}

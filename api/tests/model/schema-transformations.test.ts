import { Schema as S } from "@effect/schema";

import {
  ModelAgeGroup,
  ModelAgeGroupFromString,
} from "../../model/interfaces/application";
import { Effect } from "effect";

const ModelTestType = S.Struct({
  aaa: S.String,
  bbb: S.optional(S.String),
  ccc: ModelAgeGroupFromString,
});

type ModelTestType = S.Struct.Type<typeof ModelTestType.fields>;

type ModelTestEncodedType = S.Struct.Encoded<typeof ModelTestType.fields>;

test("ModelAgeGroup schema should decode valid string to ModelAgeGroup", () => {
  const input = "21-25";
  const expected = "21-25" as ModelAgeGroup;

  const actual = Effect.runSync(S.decode(ModelAgeGroupFromString)(input));
  expect(actual).toBe(expected);
});

test("ModelAgeGroup schema should fail to decode invalid string", () => {
  const input = "invalid";

  expect(() =>
    Effect.runSync(S.decode(ModelAgeGroupFromString)(input))
  ).toThrow();
});

test("ModelTestType schema should decode valid object to ModelTestType", () => {
  const input: ModelTestEncodedType = {
    aaa: "aaa",
    ccc: "21-25",
  };
  const expected: ModelTestType = {
    aaa: "aaa",
    ccc: "21-25",
  };

  const actual = Effect.runSync(S.decode(ModelTestType)(input));

  expect(actual).toStrictEqual(expected);
});

test("ModelTestType schema should fail to decode invalid object", () => {
  const input: ModelTestEncodedType = {
    aaa: "aaa",
    ccc: "invalid-age-group",
  };

  expect(() => Effect.runSync(S.decode(ModelTestType)(input))).toThrow();
});

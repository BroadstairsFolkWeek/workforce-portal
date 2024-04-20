import { Effect, Layer } from "effect";
import { GraphListAccess } from "../model/graph/graph-list-access";
import { defaultListAccess } from "../model/graph/default-graph-list-access";
import { defaultGraphClient } from "../graph/default-graph-client";

import "isomorphic-fetch";

test("get application list items", async () => {
  const program = Effect.all([GraphListAccess]).pipe(
    Effect.flatMap(([ga]) => ga.getApplicationGraphListItemsByFilter())
  );

  const layers = defaultListAccess.pipe(Layer.provide(defaultGraphClient));

  const runnable = Effect.provide(program, layers);

  const result = await Effect.runPromise(runnable);

  console.log(JSON.stringify(result[0], null, 2));
  expect(result.length).toBeGreaterThan(0);
});

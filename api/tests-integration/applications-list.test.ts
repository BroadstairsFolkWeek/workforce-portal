import { Effect, Layer } from "effect";
import { defaultGraphClient } from "../graph/default-graph-client";
import { ApplicationsGraphListAccess } from "../model/graph/applications-graph-list-access";

import "isomorphic-fetch";
import { applicationsGraphListAccessLive } from "../model/graph/applications-graph-list-access-live";

test("get application list items", async () => {
  const program = Effect.all([ApplicationsGraphListAccess]).pipe(
    Effect.flatMap(([ga]) => ga.getApplicationGraphListItemsByFilter())
  );

  const layers = applicationsGraphListAccessLive.pipe(
    Layer.provide(defaultGraphClient)
  );

  const runnable = Effect.provide(program, layers);

  const result = await Effect.runPromise(runnable);

  console.log(JSON.stringify(result[0], null, 2));
  expect(result.length).toBeGreaterThan(0);
});

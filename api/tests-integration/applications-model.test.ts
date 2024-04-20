import { Config, Effect, Layer } from "effect";
import { GraphListAccess } from "../model/graph/graph-list-access";
import { defaultListAccess } from "../model/graph/default-graph-list-access";
import { defaultGraphClient } from "../graph/default-graph-client";

import "isomorphic-fetch";
import {
  modelGetApplicationByApplicationId,
  modelGetApplicationByProfileId,
  modelSaveApplicationChanges,
} from "../model/applications-repository";

test("get application by Profile ID", async () => {
  const program = Config.string("TEST_PROFILE_ID").pipe(
    Effect.flatMap((profileId) => modelGetApplicationByProfileId(profileId))
  );

  const layers = defaultListAccess.pipe(Layer.provide(defaultGraphClient));

  const runnable = Effect.provide(program, layers);

  const result = await Effect.runPromise(runnable);

  console.log(JSON.stringify(result, null, 2));
});

test("get application by Application ID", async () => {
  const program = Config.string("TEST_APPLICATION_ID").pipe(
    Effect.flatMap((profileId) => modelGetApplicationByApplicationId(profileId))
  );

  const layers = defaultListAccess.pipe(Layer.provide(defaultGraphClient));

  const runnable = Effect.provide(program, layers);

  const result = await Effect.runPromise(runnable);

  console.log(JSON.stringify(result, null, 2));
});

test("update application by Application ID", async () => {
  const program = Config.string("TEST_APPLICATION_ID")
    .pipe(
      Effect.flatMap((profileId) =>
        modelGetApplicationByApplicationId(profileId)
      ),
      Effect.map(
        (application) =>
          [
            application.applicationId,
            application.version,
            application.tShirtSize,
          ] as const
      )
    )
    .pipe(
      Effect.flatMap(([applicationId, version, tShirtSize]) => {
        const newTShirtSize = tShirtSize === "S" ? "M" : "S";

        return modelSaveApplicationChanges(applicationId)(version)({
          tShirtSize: newTShirtSize,
        });
      })
    );

  const layers = defaultListAccess.pipe(Layer.provide(defaultGraphClient));

  const runnable = Effect.provide(program, layers);

  const result = await Effect.runPromise(runnable);

  console.log(JSON.stringify(result, null, 2));
});

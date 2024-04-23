import { Config, Effect, Layer } from "effect";
import { defaultListAccess } from "../model/graph/default-graph-list-access";
import { defaultGraphClient } from "../graph/default-graph-client";

import "isomorphic-fetch";
import { ApplicationsRepository } from "../model/applications-repository";
import { applicationsRepositoryLive } from "../model/applications-repository-graph";

test("get application by Profile ID", async () => {
  const program = Effect.all([
    Config.string("TEST_PROFILE_ID"),
    ApplicationsRepository,
  ]).pipe(
    Effect.andThen(([profileId, repository]) =>
      repository.modelGetApplicationByProfileId(profileId)
    )
  );

  const layers = applicationsRepositoryLive.pipe(
    Layer.provide(defaultListAccess),
    Layer.provide(defaultGraphClient)
  );

  const runnable = Effect.provide(program, layers);

  const result = await Effect.runPromise(runnable);

  console.log(JSON.stringify(result, null, 2));
});

test("get application by Application ID", async () => {
  const program = Effect.all([
    Config.string("TEST_APPLICATION_ID"),
    ApplicationsRepository,
  ]).pipe(
    Effect.andThen(([profileId, repository]) =>
      repository.modelGetApplicationByApplicationId(profileId)
    )
  );

  const layers = applicationsRepositoryLive.pipe(
    Layer.provide(defaultListAccess),
    Layer.provide(defaultGraphClient)
  );

  const runnable = Effect.provide(program, layers);

  const result = await Effect.runPromise(runnable);

  console.log(JSON.stringify(result, null, 2));
});

test("update application by Application ID", async () => {
  const program = Effect.all([
    Config.string("TEST_APPLICATION_ID"),
    ApplicationsRepository,
  ]).pipe(
    Effect.andThen(([profileId, repository]) =>
      repository.modelGetApplicationByApplicationId(profileId).pipe(
        Effect.andThen(
          (application) =>
            [
              application.applicationId,
              application.version,
              application.tShirtSize,
            ] as const
        ),
        Effect.andThen(([applicationId, version, tShirtSize]) => {
          const newTShirtSize = tShirtSize === "S" ? "M" : "S";

          return repository.modelSaveApplicationChanges(applicationId)(version)(
            {
              tShirtSize: newTShirtSize,
            }
          );
        })
      )
    )
  );

  const layers = applicationsRepositoryLive.pipe(
    Layer.provide(defaultListAccess),
    Layer.provide(defaultGraphClient)
  );

  const runnable = Effect.provide(program, layers);

  const result = await Effect.runPromise(runnable);

  console.log(JSON.stringify(result, null, 2));
});

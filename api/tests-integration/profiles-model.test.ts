import { Config, Effect, Layer } from "effect";
import { defaultGraphClient } from "../graph/default-graph-client";

import { ProfilesRepository } from "../model/profiles-repository";
import { profilesRepositoryLive } from "../model/profiles-repository-live";
import { profilesGraphListAccessLive } from "../model/graph/profiles-graph-list-access-live";
import { wfApiClientLive } from "../wf-api/wf-client-live";

// These tests are carried out using a dev deployment of the wf-api azure container app.
// Dev deployments may scale to zero and therefore have a cold start time to be accounted
// for in test timeouts.
const wfApiTimeout = 30000;

test(
  "get profile by User ID",
  async () => {
    const program = Effect.all([
      Config.string("TEST_GRAPH_USER_ID"),
      ProfilesRepository,
    ]).pipe(
      Effect.andThen(([userId, repository]) =>
        repository.modelGetProfileByUserId(userId)
      )
    );

    const layers = profilesRepositoryLive.pipe(
      Layer.provide(profilesGraphListAccessLive),
      Layer.provide(defaultGraphClient),
      Layer.provide(wfApiClientLive)
    );

    const runnable = Effect.provide(program, layers);

    const result = await Effect.runPromise(runnable);

    console.log(JSON.stringify(result, null, 2));
  },
  wfApiTimeout
);

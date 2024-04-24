import { Config, Effect, Layer } from "effect";
import { graphUsersRepositoryLive } from "../model/graph-users-repository-graph";
import { GraphUsersRepository } from "../model/graph-users-repository";
import { b2cGraphClient } from "../graph/b2c-graph-client";

import "isomorphic-fetch";

const layers = graphUsersRepositoryLive.pipe(Layer.provide(b2cGraphClient));

test("get graph user by ID", async () => {
  const program = Effect.all([
    Config.string("TEST_GRAPH_USER_ID"),
    GraphUsersRepository,
  ]).pipe(
    Effect.andThen(([graphUserId, repository]) =>
      repository.modelGetGraphUserById(graphUserId)
    )
  );

  const runnable = Effect.provide(program, layers);

  const result = await Effect.runPromise(runnable);

  expect(result).toBeDefined();
});

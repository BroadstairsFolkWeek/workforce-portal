import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";
import {
  GraphUserNotFound,
  GraphUsersRepository,
} from "./graph-users-repository";
import { GraphClient } from "../graph/graph-client";
import { graphRequestGetOrDie } from "./graph/graph";
import { ModelGraphUser } from "./interfaces/graph-user";

const bodyToGraphUser = (body: unknown) => {
  return Schema.decodeUnknown(ModelGraphUser)(body);
};

const modelGetGraphUserById = (id: string) => {
  return GraphClient.pipe(
    Effect.andThen((graphClient) => graphClient.client),
    Effect.andThen((client) =>
      client
        .api(`/users/${id}`)
        .select(["displayName", "id", "identities", "userPrincipalName"])
    ),
    Effect.andThen(graphRequestGetOrDie),
    Effect.catchTag("GraphClientGraphError", (e) =>
      e.graphError.statusCode === 404
        ? Effect.fail(new GraphUserNotFound())
        : Effect.die(e.graphError)
    ),
    Effect.andThen(bodyToGraphUser),
    // Parse errors of data from Graph/SharePoint are considered unrecoverable.
    Effect.catchTag("ParseError", (e) => Effect.die(e))
  );
};

export const graphUsersRepositoryLive = Layer.effect(
  GraphUsersRepository,
  GraphClient.pipe(
    Effect.map((graphClient) => ({
      modelGetGraphUserById: (id: string) =>
        modelGetGraphUserById(id).pipe(
          Effect.provideService(GraphClient, graphClient)
        ),
    }))
  )
);

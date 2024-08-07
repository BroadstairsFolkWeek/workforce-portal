import { Layer } from "effect";
import { b2cGraphClient } from "../graph/b2c-graph-client";
import { graphUsersRepositoryLive } from "../model/graph-users-repository-graph";
import { profilesRepositoryLive } from "../model/profiles-repository-live";
import { fetchApiLive } from "../fetch/fetch-api-live";
import { wfApiClientLive } from "../wf-api/wf-client-live";
import { formsRepositoryLive } from "../model/forms-repository-live";

const graphUsersLayer = graphUsersRepositoryLive.pipe(
  Layer.provide(b2cGraphClient)
);

export const repositoriesLayerLive = Layer.mergeAll(
  graphUsersLayer,
  profilesRepositoryLive,
  formsRepositoryLive
).pipe(Layer.provide(fetchApiLive), Layer.provide(wfApiClientLive));

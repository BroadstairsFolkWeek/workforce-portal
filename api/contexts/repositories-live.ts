import { Layer } from "effect";
import { b2cGraphClient } from "../graph/b2c-graph-client";
import { graphUsersRepositoryLive } from "../model/graph-users-repository-graph";
import { userLoginRepositoryLive } from "../model/user-logins-repository-graph";
import { applicationsRepositoryLive } from "../model/applications-repository-graph";
import { profilesRepositoryLive } from "../model/profiles-repository-live";
import { graphListAccessesLive } from "./graph-list-access-live";
import { defaultGraphClient } from "../graph/default-graph-client";
import { teamsRepositoryLive } from "../model/teams-repository-graph";
import { photosRepositoryLive } from "../model/photos-repository-graph";
import { fetchApiLive } from "../fetch/fetch-api-live";
import { wfApiClientLive } from "../wf-api/wf-client-live";

const graphUsersLayer = graphUsersRepositoryLive.pipe(
  Layer.provide(b2cGraphClient)
);

export const repositoriesLayerLive = Layer.mergeAll(
  userLoginRepositoryLive,
  applicationsRepositoryLive,
  graphUsersLayer,
  profilesRepositoryLive,
  teamsRepositoryLive,
  photosRepositoryLive
).pipe(
  Layer.provide(graphListAccessesLive),
  Layer.provide(defaultGraphClient),
  Layer.provide(fetchApiLive),
  Layer.provide(wfApiClientLive)
);

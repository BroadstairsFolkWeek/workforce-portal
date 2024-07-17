import { Layer } from "effect";
import { applicationsGraphListAccessLive } from "../model/graph/applications-graph-list-access-live";
import { userLoginsGraphListAccessLive } from "../model/graph/user-logins-graph-list-access-live";
import { teamsGraphListAccessLive } from "../model/graph/teams-graph-list-access-live";
import { photosGraphListAccessLive } from "../model/graph/photos-graph-list-access-live";

export const graphListAccessesLive = Layer.mergeAll(
  applicationsGraphListAccessLive,
  userLoginsGraphListAccessLive,
  teamsGraphListAccessLive,
  photosGraphListAccessLive
);

import { Layer } from "effect";
import { applicationsGraphListAccessLive } from "./applications-graph-list-access-live";
import { userLoginsGraphListAccessLive } from "./user-logins-graph-list-access-live";
import { profilesGraphListAccessLive } from "./profiles-graph-list-access-live";

export const graphListAccessesLive = Layer.mergeAll(
  applicationsGraphListAccessLive,
  userLoginsGraphListAccessLive,
  profilesGraphListAccessLive
);

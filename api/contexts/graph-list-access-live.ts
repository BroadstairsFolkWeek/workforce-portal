import { Layer } from "effect";
import { userLoginsGraphListAccessLive } from "../model/graph/user-logins-graph-list-access-live";
import { photosGraphListAccessLive } from "../model/graph/photos-graph-list-access-live";

export const graphListAccessesLive = Layer.mergeAll(
  userLoginsGraphListAccessLive,
  photosGraphListAccessLive
);

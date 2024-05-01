import { Config, Effect, Layer } from "effect";
import { GraphClient } from "../../graph/graph-client";
import { ProfilesGraphListAccess } from "./profiles-graph-list-access";
import {
  createGraphListItem,
  getListItemsByFilter,
} from "./common-graph-list-access";

// Any config error is unrecoverable.
const profilesListId = Config.string("WORKFORCE_PROFILES_LIST_GUID").pipe(
  Effect.orDie
);

export const profilesGraphListAccessLive = Layer.effect(
  ProfilesGraphListAccess,
  Effect.all([profilesListId, GraphClient]).pipe(
    Effect.map(([userLoginsListId, graphClient]) =>
      ProfilesGraphListAccess.of({
        getProfileGraphListItemsByFilter: (filter?: string) =>
          getListItemsByFilter(userLoginsListId)(filter).pipe(
            Effect.provideService(GraphClient, graphClient)
          ),

        createProfileGraphListItem: (fields: any) =>
          createGraphListItem(userLoginsListId)(fields).pipe(
            Effect.provideService(GraphClient, graphClient)
          ),
      })
    )
  )
);

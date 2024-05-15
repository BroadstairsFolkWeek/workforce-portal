import { Config, Effect, Layer } from "effect";
import { GraphClient } from "../../graph/graph-client";
import { getListItemsByFilter } from "./common-graph-list-access";
import { TeamsGraphListAccess } from "./teams-graph-list-access";

// Any config error is unrecoverable.
const teamsListId = Config.string("WORKFORCE_TEAMS_LIST_GUID").pipe(
  Effect.orDie
);

export const teamsGraphListAccessLive = Layer.effect(
  TeamsGraphListAccess,
  Effect.all([teamsListId, GraphClient]).pipe(
    Effect.map(([teamsListId, graphClient]) =>
      TeamsGraphListAccess.of({
        getTeamGraphListItemsByFilter: (filter?: string) =>
          getListItemsByFilter(teamsListId)(filter).pipe(
            Effect.provideService(GraphClient, graphClient)
          ),
      })
    )
  )
);

import { Config, Effect, Layer } from "effect";
import { GraphClient } from "../../graph/graph-client";
import { UserLoginsGraphListAccess } from "./user-logins-graph-list-access";
import {
  createGraphListItem,
  getListItemsByFilter,
} from "./common-graph-list-access";

// Any config error is unrecoverable.
const userLoginsListId = Config.string("WORKFORCE_LOGINS_LIST_GUID").pipe(
  Effect.orDie
);

export const userLoginsGraphListAccessLive = Layer.effect(
  UserLoginsGraphListAccess,
  Effect.all([userLoginsListId, GraphClient]).pipe(
    Effect.map(([userLoginsListId, graphClient]) =>
      UserLoginsGraphListAccess.of({
        getUserLoginGraphListItemsByFilter: (filter?: string) =>
          getListItemsByFilter(userLoginsListId)(filter).pipe(
            Effect.provideService(GraphClient, graphClient)
          ),

        createUserLoginGraphListItem: (fields: any) =>
          createGraphListItem(userLoginsListId)(fields).pipe(
            Effect.provideService(GraphClient, graphClient)
          ),
      })
    )
  )
);

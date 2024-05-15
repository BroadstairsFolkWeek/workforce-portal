import { Effect, Context } from "effect";
import { PersistedGraphListItem } from "../interfaces/graph/graph-items";

export class TeamsGraphListAccess extends Context.Tag("TeamsGraphListAccess")<
  TeamsGraphListAccess,
  {
    readonly getTeamGraphListItemsByFilter: (
      filter?: string
    ) => Effect.Effect<PersistedGraphListItem<any>[]>;
  }
>() {}

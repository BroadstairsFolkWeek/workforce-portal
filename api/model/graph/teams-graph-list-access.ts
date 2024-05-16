import { Effect, Context } from "effect";
import { PersistedGraphListItem } from "../interfaces/graph/graph-items";
import { ModelEncodedPersistedTeam } from "../interfaces/team";

export class TeamsGraphListAccess extends Context.Tag("TeamsGraphListAccess")<
  TeamsGraphListAccess,
  {
    readonly getTeamGraphListItemsByFilter: (
      filter?: string
    ) => Effect.Effect<PersistedGraphListItem<ModelEncodedPersistedTeam>[]>;
  }
>() {}

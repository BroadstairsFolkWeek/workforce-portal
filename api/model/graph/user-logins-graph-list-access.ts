import { Effect, Context } from "effect";
import { PersistedGraphListItem } from "../interfaces/graph/graph-items";

export class UserLoginsGraphListAccess extends Context.Tag(
  "UserLoginsGraphListAccess"
)<
  UserLoginsGraphListAccess,
  {
    readonly getUserLoginGraphListItemsByFilter: (
      filter?: string
    ) => Effect.Effect<PersistedGraphListItem<any>[]>;
  }
>() {}

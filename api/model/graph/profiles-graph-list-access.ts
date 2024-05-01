import { Effect, Context } from "effect";
import { PersistedGraphListItem } from "../interfaces/graph/graph-items";

export class ProfilesGraphListAccess extends Context.Tag(
  "ProfilesGraphListAccess"
)<
  ProfilesGraphListAccess,
  {
    readonly getProfileGraphListItemsByFilter: (
      filter?: string
    ) => Effect.Effect<PersistedGraphListItem<any>[]>;

    readonly createProfileGraphListItem: (fields: any) => Effect.Effect<any>;
  }
>() {}

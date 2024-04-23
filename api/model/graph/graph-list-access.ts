import { Effect, Context } from "effect";
import { PersistedGraphListItem } from "../interfaces/graph/graph-items";

export class GraphListAccess extends Context.Tag("GraphListAccess")<
  GraphListAccess,
  {
    readonly getApplicationGraphListItemsByFilter: (
      filter?: string
    ) => Effect.Effect<PersistedGraphListItem<any>[]>;

    readonly getUserLoginGraphListItemsByFilter: (
      filter?: string
    ) => Effect.Effect<PersistedGraphListItem<any>[]>;

    readonly updateApplicationGraphListItemFields: (
      id: number,
      versionedChanges: any
    ) => Effect.Effect<any>;
  }
>() {}

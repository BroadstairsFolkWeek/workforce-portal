import { Effect, Context } from "effect";
import { PersistedGraphListItem } from "../interfaces/graph/graph-items";

export class ApplicationsGraphListAccess extends Context.Tag(
  "ApplicationsGraphListAccess"
)<
  ApplicationsGraphListAccess,
  {
    readonly getApplicationGraphListItemsByFilter: (
      filter?: string
    ) => Effect.Effect<PersistedGraphListItem<any>[]>;

    readonly updateApplicationGraphListItemFields: (
      id: number,
      versionedChanges: any
    ) => Effect.Effect<any>;
  }
>() {}

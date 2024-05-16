import { Effect, Context } from "effect";
import { PersistedGraphListItem } from "../interfaces/graph/graph-items";
import {
  ModelEncodedApplicationChanges,
  ModelEncodedPersistedApplication,
} from "../interfaces/application";

export class ApplicationsGraphListAccess extends Context.Tag(
  "ApplicationsGraphListAccess"
)<
  ApplicationsGraphListAccess,
  {
    readonly getApplicationGraphListItemsByFilter: (
      filter?: string
    ) => Effect.Effect<
      PersistedGraphListItem<ModelEncodedPersistedApplication>[]
    >;

    readonly updateApplicationGraphListItemFields: (
      id: number,
      changes: ModelEncodedApplicationChanges
    ) => Effect.Effect<ModelEncodedPersistedApplication>;
  }
>() {}

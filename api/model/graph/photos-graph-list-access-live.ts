import { Config, Effect, Layer } from "effect";
import { GraphClient } from "../../graph/graph-client";
import {
  getListItemsByFilter,
  updateGraphListItemFields,
} from "./common-graph-list-access";
import { PhotosGraphListAccess } from "./photos-graph-list-access";
import {
  ModelEncodedPersistedPhoto,
  ModelEncodedPhotoChanges,
} from "../interfaces/photo";

// Any config error is unrecoverable.
const photosListId = Config.string("WORKFORCE_PHOTOS_LIST_GUID").pipe(
  Effect.orDie
);

export const photosGraphListAccessLive = Layer.effect(
  PhotosGraphListAccess,
  Effect.all([photosListId, GraphClient]).pipe(
    Effect.map(([photosListId, graphClient]) =>
      PhotosGraphListAccess.of({
        getPhotoGraphListItemsByFilter: (filter?: string) =>
          getListItemsByFilter(photosListId)<ModelEncodedPersistedPhoto>(
            filter
          ).pipe(Effect.provideService(GraphClient, graphClient)),

        updatePhotoGraphListItemFields: (
          id: number,
          changes: ModelEncodedPhotoChanges
        ) =>
          updateGraphListItemFields(photosListId)<ModelEncodedPersistedPhoto>(
            id,
            changes
          ).pipe(Effect.provideService(GraphClient, graphClient)),
      })
    )
  )
);

import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";
import { PersistedGraphListItemFields } from "./interfaces/graph/graph-items";
import { PhotoNotFound, PhotosRepository } from "./photos-repository";
import { PhotosGraphListAccess } from "./graph/photos-graph-list-access";
import { ModelPersistedPhoto, ModelPhotoChanges } from "./interfaces/photo";

const fieldsToPhoto = (fields: PersistedGraphListItemFields) => {
  return Schema.decodeUnknown(ModelPersistedPhoto)(fields);
};

const modelGetPhotoByFilter = (filter: string) => {
  return PhotosGraphListAccess.pipe(
    Effect.flatMap((listAccess) =>
      listAccess.getPhotoGraphListItemsByFilter(filter)
    ),
    Effect.head,
    Effect.catchTag("NoSuchElementException", () =>
      Effect.fail(new PhotoNotFound())
    ),
    Effect.map((item) => item.fields),
    Effect.flatMap((fields) => fieldsToPhoto(fields)),
    // Parse errors of data from Graph/SharePoint are considered unrecoverable.
    Effect.catchTag("ParseError", (e) => Effect.die(e))
  );
};

const modelGetPhotoByPhotoId = (photoId: string) => {
  return modelGetPhotoByFilter(`fields/PhotoId eq '${photoId}'`);
};

const modelSavePhotoChanges =
  (photoId: string) => (changes: ModelPhotoChanges) => {
    const dbIdAndConflictCheck = modelGetPhotoByPhotoId(photoId).pipe(
      Effect.map((application) => application.dbId)
    );

    return Effect.all([
      dbIdAndConflictCheck,
      Schema.encode(ModelPhotoChanges)(changes),
      PhotosGraphListAccess,
    ]).pipe(
      Effect.flatMap(([dbId, fields, listAccess]) =>
        listAccess.updatePhotoGraphListItemFields(dbId, fields)
      ),
      Effect.flatMap((fields) => fieldsToPhoto(fields)),
      // Parse errors of data from Graph/SharePoint are considered unrecoverable.
      Effect.catchTag("ParseError", (e) => Effect.die(e))
    );
  };

export const photosRepositoryLive = Layer.effect(
  PhotosRepository,
  PhotosGraphListAccess.pipe(
    Effect.map((service) => ({
      modelGetPhotoByPhotoId: (photoId: string) =>
        modelGetPhotoByPhotoId(photoId).pipe(
          Effect.provideService(PhotosGraphListAccess, service)
        ),

      modelSavePhotoChanges:
        (photoId: string) => (changes: ModelPhotoChanges) =>
          modelSavePhotoChanges(photoId)(changes).pipe(
            Effect.provideService(PhotosGraphListAccess, service)
          ),
    }))
  )
);

import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";
import { PersistedGraphListItemFields } from "./interfaces/graph/graph-items";
import { PhotoNotFound, PhotosRepository } from "./photos-repository";
import { PhotosGraphListAccess } from "./graph/photos-graph-list-access";
import { ModelPersistedPhoto, ModelPhotoChanges } from "./interfaces/photo";
import { FetchApi } from "../fetch/fetch-api";

const PhotoListItem = Schema.Struct({
  fields: ModelPersistedPhoto,
  driveItem: Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    parentReference: Schema.Struct({
      driveId: Schema.String,
    }),
    "@microsoft.graph.downloadUrl": Schema.String,
    file: Schema.Struct({
      mimeType: Schema.String,
    }),
  }),
});

interface PhotoListItem extends Schema.Schema.Type<typeof PhotoListItem> {}

const PhotoListItems = Schema.Array(PhotoListItem);

const fieldsToPhoto = (fields: PersistedGraphListItemFields) => {
  return Schema.decodeUnknown(ModelPersistedPhoto)(fields);
};

const getPhotoListItemsByFilter = (filter: string) =>
  PhotosGraphListAccess.pipe(
    Effect.andThen((listAccess) =>
      listAccess.getPhotoGraphListItemsByFilter(filter)
    ),
    Effect.andThen(Schema.decodeUnknown(PhotoListItems)),
    // Parse errors of data from Graph/SharePoint are considered unrecoverable.
    Effect.catchTag("ParseError", (e) => Effect.die(e))
  );

const getFirstPhotoListItemByFilter = (filter: string) =>
  getPhotoListItemsByFilter(filter).pipe(
    Effect.head,
    Effect.catchTag("NoSuchElementException", () =>
      Effect.fail(new PhotoNotFound())
    )
  );

const getFirstPhotoFieldsByFilter = (filter: string) =>
  getFirstPhotoListItemByFilter(filter).pipe(Effect.map((item) => item.fields));

const getFirstPhotoContentByFilter = (filter: string) =>
  getFirstPhotoListItemByFilter(filter).pipe(
    Effect.andThen((item) =>
      FetchApi.pipe(
        Effect.andThen((fetchApi) =>
          fetchApi.fetchGet(item.driveItem["@microsoft.graph.downloadUrl"])
        ),
        Effect.andThen((content) => ({
          mimeType: item.driveItem.file.mimeType,
          content,
        }))
      )
    ),
    // HTTP errors are considered unrecoverable.
    Effect.catchTag("RequestError", (e) => Effect.die(e)),
    Effect.catchTag("ResponseError", (e) => Effect.die(e))
  );

const modelGetPhotoByPhotoId = (photoId: string) => {
  return getFirstPhotoFieldsByFilter(`fields/PhotoId eq '${photoId}'`);
};

const modelGetPhotoContentByPhotoId = (photoId: string) =>
  getFirstPhotoContentByFilter(`fields/PhotoId eq '${photoId}'`);

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

export const photosRepositoryLive = Layer.effect(PhotosRepository)(
  Effect.all([PhotosGraphListAccess, FetchApi]).pipe(
    Effect.andThen(([photosListAccess, fetchApi]) => ({
      modelGetPhotoByPhotoId: (photoId: string) =>
        modelGetPhotoByPhotoId(photoId).pipe(
          Effect.provideService(PhotosGraphListAccess, photosListAccess)
        ),

      modelGetPhotoContentByPhotoId: (photoId: string) =>
        modelGetPhotoContentByPhotoId(photoId).pipe(
          Effect.provideService(PhotosGraphListAccess, photosListAccess),
          Effect.provideService(FetchApi, fetchApi)
        ),

      modelSavePhotoChanges:
        (photoId: string) => (changes: ModelPhotoChanges) =>
          modelSavePhotoChanges(photoId)(changes).pipe(
            Effect.provideService(PhotosGraphListAccess, photosListAccess)
          ),
    }))
  )
);

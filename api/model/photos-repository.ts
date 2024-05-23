import { Effect, Context } from "effect";
import { ModelPersistedPhoto, ModelPhotoChanges } from "./interfaces/photo";

export class PhotoNotFound {
  readonly _tag = "PhotoNotFound";
}

export interface ModelPhotoContentWithMimeType {
  mimeType: string;
  content: ArrayBuffer;
}

export class PhotosRepository extends Context.Tag("PhotosRepository")<
  PhotosRepository,
  {
    readonly modelGetPhotoByPhotoId: (
      photoId: string
    ) => Effect.Effect<ModelPersistedPhoto, PhotoNotFound>;

    readonly modelGetPhotoContentByPhotoId: (
      photoId: string
    ) => Effect.Effect<ModelPhotoContentWithMimeType, PhotoNotFound>;

    readonly modelSavePhotoChanges: (
      photoId: string
    ) => (
      changes: ModelPhotoChanges
    ) => Effect.Effect<ModelPersistedPhoto, PhotoNotFound>;
  }
>() {}

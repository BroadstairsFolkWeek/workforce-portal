import { Effect, Context } from "effect";
import { ModelPersistedPhoto, ModelPhotoChanges } from "./interfaces/photo";

export class PhotoNotFound {
  readonly _tag = "PhotoNotFound";
}

export class PhotosRepository extends Context.Tag("PhotosRepository")<
  PhotosRepository,
  {
    readonly modelGetPhotoByPhotoId: (
      photoId: string
    ) => Effect.Effect<ModelPersistedPhoto, PhotoNotFound>;

    readonly modelSavePhotoChanges: (
      photoId: string
    ) => (
      changes: ModelPhotoChanges
    ) => Effect.Effect<ModelPersistedPhoto, PhotoNotFound>;
  }
>() {}

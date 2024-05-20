import { Effect } from "effect";
import { PhotosRepository } from "../model/photos-repository";
import { logTrace } from "../utilties/logging";
import {
  deletePhotoByUniqueId,
  getProfilePhotoByUniqueFileIdId,
  updateProfilePhotoByUniqueFileId,
} from "./photos-sp";

export const setApplicationIdForPhoto = async (
  encodedPhotoId: string,
  applicationId: string
): Promise<void> => {
  const [uniqueId] = encodedPhotoId.split(":");
  const photo = await getProfilePhotoByUniqueFileIdId(uniqueId);

  if (photo.applicationId !== applicationId) {
    logTrace(
      "setApplicationIdForPhoto: Setting application id " +
        applicationId +
        " on photo with unique id: " +
        uniqueId
    );
    updateProfilePhotoByUniqueFileId(uniqueId, { ...photo, applicationId });
  }
};

export const clearProfileIdForPhoto = async (
  encodedPhotoId: string
): Promise<void> => {
  const [uniqueId] = encodedPhotoId.split(":");
  try {
    const photo = await getProfilePhotoByUniqueFileIdId(uniqueId);

    // If both Profile ID and Application ID will be clear after this update then the photo should be deleted instead.
    if (!photo.applicationId) {
      await deletePhotoByUniqueId(uniqueId);
    } else {
      await updateProfilePhotoByUniqueFileId(uniqueId, {
        ...photo,
        profileId: null,
      });
    }
  } catch (err) {
    if (
      typeof err === "object" &&
      err &&
      "status" in err &&
      err.status === 404
    ) {
      // Photo was not found. Assume that it was already deleted.
    } else {
      console.error("Error getting photo: ", err);
      throw err;
    }
  }
};

export const clearApplicationIdForPhoto = async (
  encodedPhotoId: string
): Promise<void> => {
  const [uniqueId] = encodedPhotoId.split(":");
  const photo = await getProfilePhotoByUniqueFileIdId(uniqueId);

  // If both Profile ID and Application ID will be clear after this update then the photo should be deleted instead.
  if (!photo.profileId) {
    await deletePhotoByUniqueId(uniqueId);
  } else {
    await updateProfilePhotoByUniqueFileId(uniqueId, {
      ...photo,
      applicationId: null,
    });
  }
};

const photoIdFromEncodedPhotoId = (encodedPhotoId: string) => {
  const splitIds = encodedPhotoId.split(":");
  if (splitIds.length > 1) {
    return splitIds[1];
  } else {
    return splitIds[0];
  }
};

export const clearApplicationIdForPhotoEffect = (encodedPhotoId: string) => {
  const photoId = photoIdFromEncodedPhotoId(encodedPhotoId);

  return PhotosRepository.pipe(
    Effect.andThen((repo) =>
      repo.modelSavePhotoChanges(photoId)({
        applicationId: null,
      })
    )
  );
};

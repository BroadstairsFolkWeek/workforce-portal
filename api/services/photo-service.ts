import { logTrace } from "../utilties/logging";
import {
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

export const clearApplicationIdForPhoto = async (
  encodedPhotoId: string
): Promise<void> => {
  const [uniqueId] = encodedPhotoId.split(":");
  const photo = await getProfilePhotoByUniqueFileIdId(uniqueId);

  updateProfilePhotoByUniqueFileId(uniqueId, {
    ...photo,
    applicationId: null,
  });
};

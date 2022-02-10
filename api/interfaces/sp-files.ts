export type ACCEPTED_IMAGE_MIME_TYPES = "image/png" | "image/jpeg";
export type ACCEPTED_IMAGE_EXTENSIONS = "jpg" | "png";

export const ACCEPTED_MIME_TYPE_FILE_EXTENSIONS_MAPPING: {
  [x in ACCEPTED_IMAGE_MIME_TYPES]: ACCEPTED_IMAGE_EXTENSIONS;
} = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

export const isAcceptedMimeType = (
  candidate: string
): candidate is ACCEPTED_IMAGE_MIME_TYPES => {
  return ACCEPTED_MIME_TYPE_FILE_EXTENSIONS_MAPPING[candidate];
};

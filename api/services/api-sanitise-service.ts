import { ParsedFile } from "@anzp/azure-function-multipart/dist/types/parsed-file.type";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_MIME_TYPES,
  ACCEPTED_MIME_TYPE_FILE_EXTENSIONS_MAPPING,
  isAcceptedMimeType,
} from "../interfaces/sp-files";

const API_SANITISE_SERVICE_ERROR_TYPE_VAL =
  "sanitise-service-error-5285b9b9-b97e-4585-a0ee-bb4e8e311ea4";

type ApiSanitiseServiceErrorType = "invalid-request";

export class ApiSantiiseServiceError {
  private type: typeof API_SANITISE_SERVICE_ERROR_TYPE_VAL =
    API_SANITISE_SERVICE_ERROR_TYPE_VAL;
  public error: ApiSanitiseServiceErrorType;
  public arg1: any | null;

  constructor(error: ApiSanitiseServiceErrorType, arg1?: any) {
    this.error = error;
    this.arg1 = arg1 ?? null;
  }
}

export function isApiSanitiseServiceError(
  obj: any
): obj is ApiSantiiseServiceError {
  return obj?.type === API_SANITISE_SERVICE_ERROR_TYPE_VAL;
}

// Ensure only approved mimetypes are accepted and provide an appropriate filename extension.
export const sanitiseImageFromApiClient = (
  parsedFile: ParsedFile
): [string, ACCEPTED_IMAGE_EXTENSIONS, Buffer, ACCEPTED_IMAGE_MIME_TYPES] => {
  const mimeType = parsedFile.mimeType;
  if (!isAcceptedMimeType(mimeType)) {
    throw new ApiSantiiseServiceError(
      "invalid-request",
      "Non-permitted image format"
    );
  }

  const acceptedExtension =
    ACCEPTED_MIME_TYPE_FILE_EXTENSIONS_MAPPING[parsedFile.mimeType];

  return [
    parsedFile.filename,
    acceptedExtension,
    parsedFile.bufferFile,
    mimeType,
  ];
};

import { ParsedFile } from "@anzp/azure-function-multipart/dist/types/parsed-file.type";
import {
  ApplicationDto,
  ApplicationDtoRunType,
} from "../interfaces/application";
import {
  ProfileUpdateDtoRunType,
  UpdatableProfile,
} from "../interfaces/profile";
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

const removeNullProperties = <T>(obj: T) => {
  for (const prop in obj) {
    if (obj[prop] === null) {
      delete obj[prop];
    }
  }
};

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

export const sanitiseApplicationFromApiClient = (
  maybeApplicationDto: any
): ApplicationDto => {
  removeNullProperties(maybeApplicationDto);
  const applicationDto = ApplicationDtoRunType.check(maybeApplicationDto);

  const sanitisedApplicationDto: ApplicationDto = {
    telephone: applicationDto.telephone,
    address: applicationDto.address,
    emergencyContactName: applicationDto.emergencyContactName,
    emergencyContactTelephone: applicationDto.emergencyContactTelephone,
    previousVolunteer: applicationDto.previousVolunteer,
    previousTeam: applicationDto.previousTeam,
    firstAidCertificate: applicationDto.firstAidCertificate,
    occupationOrSkills: applicationDto.occupationOrSkills,
    dbsDisclosureNumber: applicationDto.dbsDisclosureNumber,
    dbsDisclosureDate: applicationDto.dbsDisclosureDate,
    camping: applicationDto.camping,
    tShirtSize: applicationDto.tShirtSize,
    ageGroup: applicationDto.ageGroup,
    otherInformation: applicationDto.otherInformation,
    teamPreference1: applicationDto.teamPreference1,
    teamPreference2: applicationDto.teamPreference2,
    teamPreference3: applicationDto.teamPreference3,
    personsPreference: applicationDto.personsPreference,
    version: applicationDto.version,
  };

  return sanitisedApplicationDto;
};

export const sanitiseProfileUpdateFromApiClient = (
  maybeUserProfileUpdate: any
): UpdatableProfile => {
  const userProfileDto = ProfileUpdateDtoRunType.check(maybeUserProfileUpdate);

  const sanitisedUserLogin: UpdatableProfile = {
    displayName: userProfileDto.displayName,
    givenName: userProfileDto.givenName,
    surname: userProfileDto.surname,
    telephone: userProfileDto.telephone,
    address: userProfileDto.address,
    version: userProfileDto.version,
  };

  return sanitisedUserLogin;
};

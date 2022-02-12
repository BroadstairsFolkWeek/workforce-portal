import { UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AddableApplication, Application } from "../interfaces/application";
import { UserLogin } from "../interfaces/user-login";
import { logTrace, logWarn } from "../utilties/logging";
import {
  createApplicationListItem,
  deleteApplicationListItem,
  getUserApplication,
  updateApplicationListItem,
} from "./application-sp";

const APPLICATION_SERVICE_ERROR_TYPE_VAL =
  "application-service-error-760bf8f3-6c06-4d4d-86ce-050884c8f50a";

type ApplicationServiceErrorType = "version-conflict" | "application-not-found";
export class ApplicationServiceError {
  private type: typeof APPLICATION_SERVICE_ERROR_TYPE_VAL =
    APPLICATION_SERVICE_ERROR_TYPE_VAL;
  public error: ApplicationServiceErrorType;
  public arg1: string | Application | null;

  constructor(error: ApplicationServiceErrorType, arg1?: string | Application) {
    this.error = error;
    this.arg1 = arg1 ?? null;
  }
}

export function isApplicationServiceError(
  obj: any
): obj is ApplicationServiceError {
  return obj?.type === APPLICATION_SERVICE_ERROR_TYPE_VAL;
}

export const getApplication = async (
  userInfo: UserInfo
): Promise<Application | null> => {
  const application = await getUserApplication(userInfo.userId!);
  return application;
};

function propertyValueIsString(v: any): v is string {
  return typeof v === "string";
}

const isPropertyValueMissing = <T>(
  addableApplication: T,
  field: keyof T
): boolean => {
  if (
    addableApplication[field] === undefined ||
    addableApplication[field] === null
  ) {
    return true;
  }

  const v = addableApplication[field];
  if (propertyValueIsString(v) && v?.toString().trim().length === 0) {
    return true;
  }

  return false;
};

const determineApplicationStatus = (
  addableApplication: AddableApplication,
  userProfile: UserLogin
): AddableApplication["status"] => {
  logTrace(
    "determineApplicationStatus: addableApplication: " +
      JSON.stringify(addableApplication, null, 2)
  );

  const mandatoryFields: Array<keyof AddableApplication> = [
    "emergencyContactName",
    "emergencyContactTelephone",
    "ageGroup",
    "tShirtSize",
  ];
  if (
    mandatoryFields.some((field) =>
      isPropertyValueMissing(addableApplication, field)
    )
  ) {
    return "info-required";
  }

  if (
    [
      addableApplication.teamPreference1,
      addableApplication.teamPreference2,
      addableApplication.teamPreference3,
    ].includes("Children's Events")
  ) {
    const mandatoryChildrensTeamFields: Array<keyof AddableApplication> = [
      "dbsDisclosureNumber",
      "dbsDisclosureDate",
    ];
    if (
      mandatoryChildrensTeamFields.some((field) =>
        isPropertyValueMissing(addableApplication, field)
      )
    ) {
      return "info-required";
    }
  }

  const mandatoryProfileFields: Array<keyof UserLogin> = [
    "displayName",
    "telephone",
    "address",
  ];
  if (
    mandatoryProfileFields.some((field) =>
      isPropertyValueMissing(userProfile, field)
    )
  ) {
    return "profile-required";
  }

  if (userProfile.photoRequired) {
    return "photo-required";
  }

  return "ready-to-submit";
};

export const saveApplication = async (
  addableApplication: AddableApplication,
  userProfile: UserLogin,
  existingApplication: Application | undefined
): Promise<Application> => {
  if (existingApplication) {
    logTrace("saveApplication: Application already exists. Updating");
    // If an application exists then we can update it as long as the version numbers match.
    if (existingApplication.version === addableApplication.version) {
      const updatedApplication: Application = {
        ...existingApplication,
        ...addableApplication,
        title: userProfile.displayName,
        address: userProfile.address,
        telephone: userProfile.telephone,
        version: existingApplication.version + 1,
      };
      updatedApplication.status = determineApplicationStatus(
        updatedApplication,
        userProfile
      );
      logTrace(
        "saveApplication: Determined application status: " +
          updatedApplication.status
      );

      return updateApplicationListItem(updatedApplication);
    } else {
      // The application being saved has a different version number to the existing application. The user may
      // have saved the application from another device.
      throw new ApplicationServiceError(
        "version-conflict",
        `Existing version: ${existingApplication.version}. Saving version: ${addableApplication.version}.`
      );
    }
  } else {
    logTrace(
      "saveApplication: Application does not exist. Creating new application."
    );
    const addableApplicationWithProfileValuesAndVersion = {
      ...addableApplication,
      title: userProfile.displayName,
      address: userProfile.address,
      telephone: userProfile.telephone,
      version: 1,
    };
    addableApplicationWithProfileValuesAndVersion.status =
      determineApplicationStatus(
        addableApplicationWithProfileValuesAndVersion,
        userProfile
      );
    logTrace(
      "saveApplication: Determined application status: " +
        addableApplicationWithProfileValuesAndVersion.status
    );
    return createApplicationListItem(
      addableApplicationWithProfileValuesAndVersion
    );
  }
};

export const updateApplicationFromProfile = async (
  existingApplication: Application,
  userProfile: UserLogin
): Promise<Application> => {
  const updatedApplication: Application = {
    ...existingApplication,
    title: userProfile.displayName,
    address: userProfile.address,
    telephone: userProfile.telephone,
    version: existingApplication.version + 1,
  };

  updatedApplication.status = determineApplicationStatus(
    updatedApplication,
    userProfile
  );

  logTrace(
    "updateApplicationFromProfile: Determined application status: " +
      updatedApplication.status
  );

  // Only update the application if there are any changes.
  if (
    existingApplication.title !== updatedApplication.title ||
    existingApplication.address !== updatedApplication.address ||
    existingApplication.telephone !== updatedApplication.telephone ||
    existingApplication.status !== updatedApplication.status
  ) {
    return updateApplicationListItem(updatedApplication);
  } else {
    return existingApplication;
  }
};

export const deleteApplication = async (
  userInfo: UserInfo,
  applicationVersion: number
): Promise<void> => {
  // Retrieve any application the user may have already saved.
  const existingApplication = await getUserApplication(userInfo.userId!);
  if (existingApplication) {
    logTrace(
      "deleteApplication: Retrieved existing application with version: " +
        existingApplication.version
    );

    if (applicationVersion !== existingApplication.version) {
      logWarn("deleteApplication: Aborting due to mismatched version numbers");
      throw new ApplicationServiceError("version-conflict");
    }

    await deleteApplicationListItem(existingApplication);
  } else {
    logWarn("deleteApplication: Application not found");
    throw new ApplicationServiceError("application-not-found");
  }
};

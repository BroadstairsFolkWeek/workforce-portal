import { UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AddableApplication, Application } from "../interfaces/application";
import { UserLogin } from "../interfaces/user-login";
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
): Promise<Application> => {
  const application = await getUserApplication(userInfo.userId!);

  if (application) {
    return application;
  } else {
    throw new ApplicationServiceError("application-not-found");
  }
};

const isApplicationFieldMissing = (
  addableApplication: AddableApplication,
  field: keyof AddableApplication
): boolean => {
  if (addableApplication[field] === undefined) {
    return true;
  }

  if (
    typeof addableApplication[field] === "string" &&
    addableApplication[field]?.toString().trim().length === 0
  ) {
    return true;
  }

  return false;
};

const determineApplicationStatus = (
  addableApplication: AddableApplication
): AddableApplication["status"] => {
  const mandatoryFields: Array<keyof AddableApplication> = [
    "telephone",
    "address",
    "emergencyContactName",
    "emergencyContactTelephone",
    "ageGroup",
    "tShirtSize",
  ];
  if (
    mandatoryFields.some((field) =>
      isApplicationFieldMissing(addableApplication, field)
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
        isApplicationFieldMissing(addableApplication, field)
      )
    ) {
      return "info-required";
    }
  }

  return "ready-to-submit";
};

export const saveApplication = async (
  addableApplication: AddableApplication,
  userProfile: UserLogin
): Promise<Application> => {
  // Retrieve any application the user may have already saved.
  const existingApplication = await getUserApplication(userProfile.userId);

  if (existingApplication) {
    // If an application exists then we can update it as long as the version numbers match.
    if (existingApplication.version === addableApplication.version) {
      const updatedApplication: Application = {
        ...existingApplication,
        ...addableApplication,
        version: existingApplication.version + 1,
      };
      updatedApplication.status =
        determineApplicationStatus(updatedApplication);

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
    return createApplicationListItem({ ...addableApplication, version: 1 });
  }
};

export const deleteApplication = async (
  userInfo: UserInfo,
  applicationVersion: number
): Promise<void> => {
  // Retrieve any application the user may have already saved.
  const existingApplication = await getUserApplication(userInfo.userId!);

  if (applicationVersion !== existingApplication?.version) {
    throw new ApplicationServiceError("version-conflict");
  }

  if (existingApplication) {
    await deleteApplicationListItem(existingApplication);
  } else {
    throw new ApplicationServiceError("application-not-found");
  }
};

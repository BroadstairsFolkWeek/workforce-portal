import { UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { AddableApplication, Application } from "../interfaces/application";
import { UserLogin } from "../interfaces/user-login";
import {
  createApplicationListItem,
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
      return updateApplicationListItem(updatedApplication);
    } else {
      // The application being saved has a different version number to the existing application. The user may
      // have saved the application from another device.
      throw new ApplicationServiceError(
        "version-conflict",
        existingApplication
      );
    }
  } else {
    return createApplicationListItem({ ...addableApplication, version: 1 });
  }
};

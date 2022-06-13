import { UserInfo } from "@aaronpowell/static-web-apps-api-auth";
import { logTrace } from "../utilties/logging";
import { deleteApplication } from "./application-service";
import {
  deleteUserProfile,
  getProfileForAuthenticatedUser,
} from "./profile-service";

export const deleteUser = async (userInfo: UserInfo): Promise<void> => {
  // Retrieve any application the user may have already saved.
  const profileAndApplication = await getProfileForAuthenticatedUser(userInfo);
  const existingApplication = profileAndApplication?.application;
  if (existingApplication) {
    logTrace(
      "deleteUser: Retrieved existing application with version: " +
        existingApplication.version
    );
    await deleteApplication(userInfo, existingApplication.version);
  } else {
    logTrace("deleteUser: No application found for user");
  }

  await deleteUserProfile(profileAndApplication.profile);
};

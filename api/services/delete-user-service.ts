import { logTrace } from "../utilties/logging";
import { deleteApplication } from "./application-service";
import {
  deleteUserProfile,
  getOrCreateProfileForAuthenticatedUser,
} from "./profile-service";

export const deleteUser = async (userId: string): Promise<void> => {
  // Retrieve any application the user may have already saved.
  const profileAndApplication = await getOrCreateProfileForAuthenticatedUser(
    userId
  );
  const existingApplication = profileAndApplication?.application;
  if (existingApplication) {
    logTrace(
      "deleteUser: Retrieved existing application with version: " +
        existingApplication.version
    );
    await deleteApplication(userId, existingApplication.version);
  } else {
    logTrace("deleteUser: No application found for user");
  }

  await deleteUserProfile(profileAndApplication.profile);
};

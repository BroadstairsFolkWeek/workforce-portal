import React, { useCallback, useContext, useState } from "react";
import { Application } from "../../../api/interfaces/application";
import { Profile } from "../../interfaces/profile";

/**
 * Provides the user profile for the application by retrieving it from the server api. The API will return profile
 * information according to the currently authenticated user.
 */
export type UserProfile = Profile;
export type UserProfileUpdate = Pick<
  UserProfile,
  "displayName" | "givenName" | "surname" | "telephone" | "address"
>;

export type IUserProfileContext = {
  currentApplication: Application | null;
  injectApplication: (application: Application) => void;
};

const invalidFunction = () => {
  throw new Error(
    "UserProfileContext consumer is not wrapped in a corresponding provider."
  );
};

const UserProfileContext = React.createContext<IUserProfileContext>({
  currentApplication: null,
  injectApplication: invalidFunction,
});

const UserProfileContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [currentApplication, setCurrentApplication] =
    useState<Application | null>(null);

  const injectProfileAndApplication = useCallback(
    (injectedApplication: Application) => {
      setCurrentApplication(injectedApplication);
    },
    []
  );

  return (
    <UserProfileContext.Provider
      value={{
        currentApplication,
        injectApplication: injectProfileAndApplication,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

const useUserProfile = () => useContext(UserProfileContext);

export { UserProfileContextProvider, useUserProfile };

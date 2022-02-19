import React, { useCallback, useContext, useEffect, useState } from "react";
import { Application } from "../../../api/interfaces/application";
import { Profile } from "../../../api/interfaces/profile";

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
  loaded: boolean;
  userProfile: UserProfile | null;
  profileComplete: boolean;
  currentApplication: Application | null;
  saveUserProfile: (userProfile: UserProfileUpdate) => Promise<number>;
  injectProfileAndApplication: (
    userProfile: UserProfile,
    application?: Application
  ) => void;
};

const invalidFunction = () => {
  throw new Error(
    "UserProfileContext consumer is not wrapped in a corresponding provider."
  );
};

const UserProfileContext = React.createContext<IUserProfileContext>({
  loaded: false,
  userProfile: null,
  profileComplete: false,
  currentApplication: null,
  saveUserProfile: invalidFunction,
  injectProfileAndApplication: invalidFunction,
});

const UserProfileContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean>(false);
  const [currentApplication, setCurrentApplication] =
    useState<Application | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchProfile = useCallback(async () => {
    const fetchResponse = await fetch("/api/profile");
    if (fetchResponse.ok) {
      const profileAndApplication = await fetchResponse.json();
      setUserProfile(profileAndApplication.profile);
      if (profileAndApplication.application) {
        setCurrentApplication(profileAndApplication.application);
      }
    }
    setLoaded(true);
  }, []);

  const saveUserProfile = useCallback(
    async (updates: UserProfileUpdate) => {
      try {
        if (userProfile) {
          const updatedProfile: UserProfile = {
            ...userProfile,
            ...updates,
          };
          const saveResponse = await fetch("/api/updateProfile", {
            method: "POST",
            body: JSON.stringify(updatedProfile),
          });

          if (saveResponse.status === 200 || saveResponse.status === 409) {
            const profileAndApplication = await saveResponse.json();
            setUserProfile(profileAndApplication.profile);
            if (profileAndApplication.application) {
              setCurrentApplication(profileAndApplication.application);
            }
          }

          // Return the status code as a way for callers to detect different types of errors.
          return saveResponse.status;
        } else {
          // Not logged in, can't save.
          return 401;
        }
      } catch (err: any) {
        console.log(err);
        return -1;
      }
    },
    [userProfile]
  );

  const injectProfileAndApplication = useCallback(
    (injectedProfile: UserProfile, injectedApplication?: Application) => {
      setUserProfile(injectedProfile);
      if (injectedApplication) {
        setCurrentApplication(injectedApplication);
      }
    },
    []
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (userProfile) {
      setProfileComplete(
        !!userProfile.displayName &&
          !!userProfile.givenName &&
          !!userProfile.surname &&
          !!userProfile.address &&
          !!userProfile.telephone
      );
    } else {
      setProfileComplete(false);
    }
  }, [userProfile]);

  return (
    <UserProfileContext.Provider
      value={{
        loaded,
        userProfile,
        profileComplete,
        currentApplication,
        saveUserProfile,
        injectProfileAndApplication,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

const useUserProfile = () => useContext(UserProfileContext);

export { UserProfileContextProvider, useUserProfile };

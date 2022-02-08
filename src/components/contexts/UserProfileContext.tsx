import React, { useCallback, useContext, useEffect, useState } from "react";
import { UserLogin } from "../../../api/interfaces/user-login";

/**
 * Provides the user profile for the application by retrieving it from the server api. The API will return profile
 * information according to the currently authenticated user.
 */
export type UserProfile = UserLogin;
export type UserProfileUpdate = Pick<
  UserProfile,
  "displayName" | "givenName" | "surname" | "telephone" | "address"
>;

export type IUserProfileContext = {
  loaded: boolean;
  userProfile: UserProfile | null;
  saveUserProfile: (userProfile: UserProfileUpdate) => Promise<number>;
};

const invalidFunction = () => {
  throw new Error(
    "UserProfileContext consumer is not wrapped in a corresponding provider."
  );
};

const UserProfileContext = React.createContext<IUserProfileContext>({
  loaded: false,
  userProfile: null,
  saveUserProfile: invalidFunction,
});

const UserProfileContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchProfile = useCallback(async () => {
    const fetchResponse = await fetch("/api/profile");
    if (fetchResponse.ok) {
      const profile = await fetchResponse.json();
      setUserProfile(profile);
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
            const savedUserProfile: UserProfile = await saveResponse.json();
            if (savedUserProfile) {
              setUserProfile(savedUserProfile);
            }
          }

          // Return the status code as a way for callers to detect different types of errors.
          return saveResponse.status;
        } else {
          // No logged in, can't save.
          return 401;
        }
      } catch (err: any) {
        console.log(err);
        return -1;
      }
    },
    [userProfile]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <UserProfileContext.Provider
      value={{ loaded, userProfile, saveUserProfile }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

const useUserProfile = () => useContext(UserProfileContext);

export { UserProfileContextProvider, useUserProfile };

import React, { useContext, useEffect, useState } from "react";
import { User } from "../../api/interfaces/user";

export type UserProfile = User;

export type IUserProfileContext = {
  loaded: boolean;
  userProfile: UserProfile | null;
};

const UserProfileContext = React.createContext<IUserProfileContext>({
  loaded: false,
  userProfile: null,
});

const UserProfileContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          setUserProfile(await res.json());
        }
      } catch (e) {
        if (window.location.hostname === "localhost") {
          console.warn(
            "Can't access the profile endpoint. For local development, please use the Static Web Apps CLI to emulate authentication: https://github.com/azure/static-web-apps-cli"
          );
        } else {
          console.error(`Failed to unpack user profile from JSON.`, e);
        }
      }

      setLoaded(true);
    };

    run();
  }, []);

  return (
    <UserProfileContext.Provider value={{ loaded, userProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

const useUserProfile = () => useContext(UserProfileContext);

export { UserProfileContextProvider, useUserProfile };

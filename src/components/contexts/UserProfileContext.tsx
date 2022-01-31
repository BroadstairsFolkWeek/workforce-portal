import React, { useCallback, useContext, useEffect, useState } from "react";
import { UserLogin } from "../../../api/interfaces/user-login";
import { useClientPrincipalClaims } from "./ClientPrincipalClaimsContext";

/**
 * Provides the user profile for the application by retrieving it from the server api. The API will return profile
 * information according to the currently authenticated user.
 *
 * Additionaly, this module extracts claims from the client principal and posts them to the server, allowing the
 * server easy access to user information collected during sign-in/sign-up, such as name and email address.
 *
 * Normally this process wouldn't be needed as the server should already have access to the same principal
 * claims, but this is currently not the case. See issue - https://github.com/MicrosoftDocs/azure-docs/issues/86803
 */
export type UserProfile = UserLogin;

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
  const { claims } = useClientPrincipalClaims();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchProfile = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (claims.length) {
      fetch("/api/notifyPrincipalClaims", {
        method: "POST",
        body: JSON.stringify(claims),
      }).then(() => fetchProfile);
    }
  }, [claims, fetchProfile]);

  return (
    <UserProfileContext.Provider value={{ loaded, userProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

const useUserProfile = () => useContext(UserProfileContext);

export { UserProfileContextProvider, useUserProfile };

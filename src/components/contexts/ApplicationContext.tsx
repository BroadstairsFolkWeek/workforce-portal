import React, { useContext, useEffect, useState } from "react";
import { Application } from "../../interfaces/application";
import { useUserProfile } from "./UserProfileContext";

export type IApplicationContext = {
  loaded: boolean;
  application: Application | null;
  setApplication: (application: Application | null) => void;
};

const invalidFunction = () => {
  throw new Error(
    "ApplicationContext consumer is not wrapped in a corresponding provider."
  );
};

const ApplicationContext = React.createContext<IApplicationContext>({
  loaded: false,
  application: null,
  setApplication: invalidFunction,
});

const ApplicationContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const { userProfile, currentApplication: currentApplicationFromProfile } =
    useUserProfile();
  const [application, setApplication] = useState<Application | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setApplication(currentApplicationFromProfile);
      setLoaded(true);
    }
  }, [userProfile, currentApplicationFromProfile]);

  return (
    <ApplicationContext.Provider
      value={{
        loaded,
        application,
        setApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

const useApplication = () => useContext(ApplicationContext);

export { ApplicationContextProvider, useApplication };

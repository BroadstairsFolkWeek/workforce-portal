import React, { useCallback, useContext, useEffect, useState } from "react";
import { Application } from "../../interfaces/application";
import { useUserProfile } from "./UserProfileContext";

export type IApplicationContext = {
  loaded: boolean;
  application: Application | null;
  setApplication: (application: Application | null) => void;
  submitApplication: () => Promise<number>;
  retractApplication: () => Promise<number>;
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
  submitApplication: invalidFunction,
  retractApplication: invalidFunction,
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

  const submitApplication = useCallback(async () => {
    const submitApplicationResponse = await fetch("/api/submitApplication", {
      method: "POST",
    });

    if (
      submitApplicationResponse.status === 200 ||
      submitApplicationResponse.status === 409
    ) {
      const updatedApplication: Application =
        await submitApplicationResponse.json();
      if (updatedApplication) {
        setApplication(updatedApplication);
      }
    }

    return submitApplicationResponse.status;
  }, []);

  const retractApplication = useCallback(async () => {
    const submitApplicationResponse = await fetch("/api/retractApplication", {
      method: "POST",
    });

    if (
      submitApplicationResponse.status === 200 ||
      submitApplicationResponse.status === 409
    ) {
      const updatedApplication: Application =
        await submitApplicationResponse.json();
      if (updatedApplication) {
        setApplication(updatedApplication);
      }
    }

    return submitApplicationResponse.status;
  }, []);

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
        submitApplication,
        retractApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

const useApplication = () => useContext(ApplicationContext);

export { ApplicationContextProvider, useApplication };

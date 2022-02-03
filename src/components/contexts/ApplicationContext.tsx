import React, { useCallback, useContext, useEffect, useState } from "react";
import { Application } from "../../interfaces/application";
import { useUserProfile } from "./UserProfileContext";

export type IApplicationContext = {
  loaded: boolean;
  application: Application | null;
  error: string | null;
  refresh: () => void;
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
  error: null,
  refresh: invalidFunction,
  setApplication: invalidFunction,
});

const ApplicationContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const { userProfile } = useUserProfile();
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchApplication = useCallback(async () => {
    setLoaded(false);
    try {
      const res = await fetch("/api/getApplication");
      if (res.status === 200) {
        const json: Application = await res.json();
        if (json) {
          setApplication(json);
        }
      }
    } catch (err: any) {
      setError("Error processing application from server");
      console.log(err);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchApplication();
    }
  }, [userProfile, fetchApplication]);

  return (
    <ApplicationContext.Provider
      value={{
        loaded,
        application,
        error,
        refresh: fetchApplication,
        setApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

const useApplication = () => useContext(ApplicationContext);

export { ApplicationContextProvider, useApplication };

import React, { useCallback, useContext, useEffect, useState } from "react";
import { Application } from "../../interfaces/application";
import { useUserProfile } from "./UserProfileContext";
import { useSelector } from "react-redux";
import {
  selectFormsApplicationForm,
  selectFormsLoadingStatus,
} from "../../features/forms/forms-slice";

export type IApplicationContext = {
  loaded: boolean;
  application: Application | undefined;
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
  application: undefined,
  submitApplication: invalidFunction,
  retractApplication: invalidFunction,
});

const ApplicationContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const formsLoadingStatus = useSelector(selectFormsLoadingStatus);
  const application = useSelector(selectFormsApplicationForm);

  // const { userProfile, currentApplication: currentApplicationFromProfile } =
  //   useUserProfile();
  // const [application, setApplication] = useState<Application | null>(null);
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
    if (formsLoadingStatus === "loaded") {
      setLoaded(true);
    }
  }, [formsLoadingStatus]);

  return (
    <ApplicationContext.Provider
      value={{
        loaded,
        application,
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

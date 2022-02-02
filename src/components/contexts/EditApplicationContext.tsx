import React, { useCallback, useContext, useEffect, useState } from "react";
import { Application } from "../../interfaces/application";
import { useApplication } from "./ApplicationContext";

export type IEditApplicationContext = {
  application: Application | null;
  newApplication: () => void;
  editApplication: () => void;
  saveApplication: (application: Application) => Promise<number>;
};

const invalidFunction = () => {
  throw new Error(
    "EditApplicationContext consumer is not wrapped in a corresponding provider."
  );
};

const EditApplicationContext = React.createContext<IEditApplicationContext>({
  application: null,
  newApplication: invalidFunction,
  editApplication: invalidFunction,
  saveApplication: invalidFunction,
});

const EditApplicationContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [mode, setMode] = useState<"new" | "edit">("edit");
  const {
    application: existingApplication,
    loaded: existingApplicationLoaded,
    setApplication: setExistingApplication,
  } = useApplication();
  const [application, setApplication] = useState<Application | null>(null);

  const newApplication = useCallback(async () => {
    setMode("new");
    setApplication({
      camping: false,
      tShirtSize: undefined,
      ageGroup: undefined,
      otherInformation: "",
      teamPreference3: "",
      personsPreference: "",
      version: 0,
      lastSaved: "",
      status: "info-required",
    });
  }, []);

  const editApplication = useCallback(() => {
    if (existingApplication) {
      setApplication(existingApplication);
      setMode("edit");
    }
  }, [existingApplication]);

  useEffect(() => {
    if (mode === "edit" && existingApplicationLoaded) {
      if (existingApplication) {
        setApplication(existingApplication);
      } else {
        newApplication();
      }
    }
  }, [mode, existingApplication, existingApplicationLoaded, newApplication]);

  const saveApplication = useCallback(
    async (editedApplication: Application) => {
      try {
        const saveApplicationResponse = await fetch("/api/saveApplication", {
          method: "POST",
          body: JSON.stringify(editedApplication),
        });

        if (
          saveApplicationResponse.status === 200 ||
          saveApplicationResponse.status === 409
        ) {
          const savedApplication: Application =
            await saveApplicationResponse.json();
          if (savedApplication) {
            setApplication(savedApplication);
            setExistingApplication(savedApplication);
          }
        }

        // Return the status code as a way for callers to detect different types of errors.
        return saveApplicationResponse.status;
      } catch (err: any) {
        console.log(err);
        return -1;
      }
    },
    [setExistingApplication]
  );

  return (
    <EditApplicationContext.Provider
      value={{
        application,
        newApplication,
        editApplication,
        saveApplication,
      }}
    >
      {children}
    </EditApplicationContext.Provider>
  );
};

const useEditApplication = () => useContext(EditApplicationContext);

export { EditApplicationContextProvider, useEditApplication };

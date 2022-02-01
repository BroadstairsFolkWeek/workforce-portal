import React, { useCallback, useContext, useEffect, useState } from "react";
import { Application } from "../../interfaces/application";
import { useApplication } from "./ApplicationContext";

export type IEditApplicationContext = {
  application: Application | null;
  newApplication: () => void;
  saveApplication: (application: Application) => Promise<void>;
};

const invalidFunction = () => {
  throw new Error(
    "EditApplicationContext consumer is not wrapped in a corresponding provider."
  );
};

const EditApplicationContext = React.createContext<IEditApplicationContext>({
  application: null,
  newApplication: invalidFunction,
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
  } = useApplication();
  const [application, setApplication] = useState<Application | null>(null);

  const newApplication = useCallback(async () => {
    setMode("new");
    setApplication({
      telephone: "",
      address: "",
      emergencyContactName: "",
      emergencyContactTelephone: "",
      previousVolunteer: false,
      previousTeam: "",
      firstAidCertificate: false,
      occupationOrSkills: "",
      dbsDisclosureNumber: "",
      dbsDisclosureDate: "",
      camping: false,
      tShirtSize: "",
      ageGroup: "",
      otherInformation: "",
      teamPreference1: "",
      teamPreference2: "",
      teamPreference3: "",
      personsPreference: "",
      version: 0,
    });
  }, []);

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
    async (editedApplication: Application) => {},
    []
  );

  return (
    <EditApplicationContext.Provider
      value={{
        application,
        newApplication,
        saveApplication,
      }}
    >
      {children}
    </EditApplicationContext.Provider>
  );
};

const useEditApplication = () => useContext(EditApplicationContext);

export { EditApplicationContextProvider, useEditApplication };

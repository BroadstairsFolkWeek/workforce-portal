import React, { useCallback, useContext, useEffect, useState } from "react";
import { Application } from "../../interfaces/application";
import { useApplication } from "./ApplicationContext";

export type ApplicationUpdate = Pick<
  Application,
  | "emergencyContactName"
  | "emergencyContactTelephone"
  | "previousVolunteer"
  | "previousTeam"
  | "firstAidCertificate"
  | "occupationOrSkills"
  | "dbsDisclosureNumber"
  | "dbsDisclosureDate"
  | "camping"
  | "tShirtSize"
  | "ageGroup"
  | "otherInformation"
  | "teamPreference1"
  | "teamPreference2"
  | "teamPreference3"
  | "personsPreference"
  | "availableFirstFriday"
  | "availableSaturday"
  | "availableSunday"
  | "availableMonday"
  | "availableTuesday"
  | "availableWednesday"
  | "availableThursday"
  | "availableLastFriday"
  | "constraints"
  | "whatsApp"
  | "acceptedTermsAndConditions"
>;

export type IEditApplicationContext = {
  application: Application | null;
  newApplication: () => void;
  editApplication: () => void;
  saveApplication: (updates: ApplicationUpdate) => Promise<number>;
  deleteApplication: () => Promise<number>;
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
  deleteApplication: invalidFunction,
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
      availableFirstFriday: true,
      availableSaturday: true,
      availableSunday: true,
      availableMonday: true,
      availableTuesday: true,
      availableWednesday: true,
      availableThursday: true,
      availableLastFriday: true,
      whatsApp: true,
      acceptedTermsAndConditions: false,
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
    async (updates: ApplicationUpdate) => {
      try {
        if (application) {
          const updatedApplication: Application = {
            ...application,
            ...updates,
          };

          const saveApplicationResponse = await fetch("/api/saveApplication", {
            method: "POST",
            body: JSON.stringify(updatedApplication),
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
        } else {
          console.error("No application to update");
          return -1;
        }
      } catch (err: any) {
        console.log(err);
        return -1;
      }
    },
    [application, setExistingApplication]
  );

  const deleteApplication = useCallback(async () => {
    try {
      const deleteApplicationResponse = await fetch("/api/deleteApplication", {
        method: "POST",
        body: JSON.stringify({ version: existingApplication?.version }),
      });

      if (deleteApplicationResponse.status === 204) {
        setApplication(null);
        setExistingApplication(null);
      }

      return deleteApplicationResponse.status;
    } catch (err: any) {
      console.log(err);
      return -1;
    }
  }, [existingApplication, setExistingApplication]);

  return (
    <EditApplicationContext.Provider
      value={{
        application,
        newApplication,
        editApplication,
        saveApplication,
        deleteApplication,
      }}
    >
      {children}
    </EditApplicationContext.Provider>
  );
};

const useEditApplication = () => useContext(EditApplicationContext);

export { EditApplicationContextProvider, useEditApplication };

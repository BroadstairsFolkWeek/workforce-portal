import React, { useCallback, useContext, useEffect, useState } from "react";
import { Application } from "../../interfaces/application";
import { useApplication } from "./ApplicationContext";
import { useDispatch, useSelector } from "react-redux";
import {
  saveNewOrExistingApplication,
  selectFormsApplicationForm,
} from "../../features/forms/forms-slice";
import { AppDispatch } from "../../store";

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
  | "consentNewlifeWills"
  | "newlifeHaveWillInPlace"
  | "newlifeHavePoaInPlace"
  | "newlifeWantFreeReview"
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
  const dispatch: AppDispatch = useDispatch();

  const existingApplication = useSelector(selectFormsApplicationForm);

  const [mode, setMode] = useState<"new" | "edit">("edit");
  const { loaded: existingApplicationLoaded } = useApplication();
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
      consentNewlifeWills: false,
      newlifeHaveWillInPlace: false,
      newlifeHavePoaInPlace: false,
      newlifeWantFreeReview: false,
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
        dispatch(
          saveNewOrExistingApplication({
            mode: mode === "new" ? "new" : "existing",
            updates: updates,
          })
        );
        return 0;
      } catch (err: unknown) {
        console.log(err);
        return -1;
      }
    },
    [application]
  );

  const deleteApplication = useCallback(async () => {
    try {
      const deleteApplicationResponse = await fetch("/api/deleteApplication", {
        method: "POST",
        body: JSON.stringify({ version: existingApplication?.version }),
      });

      if (deleteApplicationResponse.status === 204) {
        setApplication(null);
        // setExistingApplication(null);
      }

      return deleteApplicationResponse.status;
    } catch (err: unknown) {
      console.log(err);
      return -1;
    }
  }, [existingApplication]);

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

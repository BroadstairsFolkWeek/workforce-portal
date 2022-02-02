import { PropsWithChildren, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Application } from "../interfaces/application";
import { useApplication } from "./contexts/ApplicationContext";
import { useEditApplication } from "./contexts/EditApplicationContext";

const ApplicationHeader = ({
  application,
  children,
}: PropsWithChildren<{
  application: Application;
}>) => {
  const statusText = "Draft";

  return (
    <div className="bg-bfw-yellow">
      <div className="flex flex-row justify-between p-2 bg-bfw-yellow text-xs whitespace-nowrap">
        <div>Workforce application</div>
        <div>{statusText}</div>
      </div>
      <div className="px-2">{children}</div>
    </div>
  );
};

const ApplicationDisplayPanel: React.FC = () => {
  const navigate = useNavigate();
  const { newApplication, editApplication } = useEditApplication();
  const { loaded: applicationLoaded, application } = useApplication();

  const newApplicationHandler = useCallback(() => {
    newApplication();
    navigate("/application");
  }, [newApplication, navigate]);

  const editItemHandler = useCallback(() => {
    editApplication();
    navigate("/application");
  }, [editApplication, navigate]);

  if (applicationLoaded) {
    if (application) {
      let actionRequiredComponent;
      if (application) {
        actionRequiredComponent = (
          <div>
            ACTION Required: When ready,{" "}
            <button onClick={editItemHandler} className="underline">
              select this application to edit it
            </button>{" "}
            and then submit to Broadstairs Folk Week.
          </div>
        );
      }

      return (
        <div>
          <ApplicationHeader application={application}>
            {actionRequiredComponent}
          </ApplicationHeader>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col h-48 p-4 bg-yellow-50 rounded-lg overflow-hidden cursor-pointer text-center">
          <p>You have not created your workforce application.</p>
          <div className="mt-8">
            <button
              type="button"
              onClick={newApplicationHandler}
              className="m-4 underline"
            >
              New Workforce Application
            </button>
          </div>
        </div>
      );
    }
  } else {
    return <div>Checking application</div>;
  }
};

export default ApplicationDisplayPanel;

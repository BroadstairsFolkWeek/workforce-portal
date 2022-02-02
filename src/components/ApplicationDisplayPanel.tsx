import { PropsWithChildren, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Application } from "../interfaces/application";
import ApplicationControls from "./ApplicationControls";
import ApplicationInfo, { applicationTodoComponents } from "./ApplicationInfo";
import { useApplication } from "./contexts/ApplicationContext";
import { useEditApplication } from "./contexts/EditApplicationContext";
import Spinner from "./Spinner";

const ApplicationHeader = ({
  application,
  children,
}: PropsWithChildren<{
  application: Application;
}>) => {
  return (
    <div className="bg-bfw-yellow">
      <div className="flex flex-row justify-between p-2 bg-bfw-yellow text-xs whitespace-nowrap">
        <div>Workforce application</div>
        <div>{application.status}</div>
      </div>
      <div className="px-2">{children}</div>
    </div>
  );
};

const ApplicationFooter = ({
  application,
  children,
}: PropsWithChildren<{
  application: Application;
}>) => {
  const todoComponents = applicationTodoComponents(application);

  if (todoComponents.length > 0) {
    return (
      <div className="bg-bfw-yellow">
        <div className="flex flex-col justify-between p-2 bg-black text-xs text-white">
          <div>TODO</div>
          <div>{todoComponents}</div>
        </div>
        <div className="px-2">{children}</div>
      </div>
    );
  } else {
    return null;
  }
};

const ApplicationDisplayPanel: React.FC = () => {
  const navigate = useNavigate();
  const { newApplication, editApplication } = useEditApplication();
  const { loaded: applicationLoaded, application } = useApplication();
  const [processing, setProcessing] = useState(false);

  const newApplicationHandler = useCallback(() => {
    setProcessing(true);
    newApplication();
    navigate("/application");
    setProcessing(false);
  }, [newApplication, navigate]);

  const editItemHandler = useCallback(() => {
    setProcessing(true);
    editApplication();
    navigate("/application");
    setProcessing(false);
  }, [editApplication, navigate]);

  const deleteItemHandler = useCallback(() => {
    setProcessing(true);
    setProcessing(false);
  }, []);

  const uploadDocumentsHandler = useCallback(() => {
    setProcessing(true);
    setProcessing(false);
  }, []);

  const submitItemHandler = useCallback(() => {
    setProcessing(true);
    setProcessing(false);
  }, []);

  const editButtonClickedHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (ev) => {
        // Stop event propagation since we also have a click handler on the whole ApplicationListItem component.
        ev.stopPropagation();

        editItemHandler();
      },
      [editItemHandler]
    );

  const deleteButtonClickedHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (ev) => {
        // Stop event propagation since we also have a click handler on the whole ApplicationListItem component.
        ev.stopPropagation();

        deleteItemHandler();
      },
      [deleteItemHandler]
    );

  const uploadButtonClickedHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (ev) => {
        // Stop event propagation since we also have a click handler on the whole ApplicationListItem component.
        ev.stopPropagation();

        uploadDocumentsHandler();
      },
      [uploadDocumentsHandler]
    );

  const submitButtonClickedHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (ev) => {
        // Stop event propagation since we also have a click handler on the whole ApplicationListItem component.
        ev.stopPropagation();

        submitItemHandler();
      },
      [submitItemHandler]
    );

  if (applicationLoaded) {
    if (application) {
      let controlsComponent;
      if (processing) {
        controlsComponent = <Spinner size="sm" />;
      } else {
        controlsComponent = (
          <div className="text-center">
            <ApplicationControls
              application={application}
              editButtonClicked={editButtonClickedHandler}
              deleteButtonClicked={deleteButtonClickedHandler}
              uploadDocumentsButtonClicked={uploadButtonClickedHandler}
              applicationSubmitButtonClcked={submitButtonClickedHandler}
            />
          </div>
        );
      }

      let actionRequiredComponent;
      if (application) {
        switch (application.status) {
          case "info-required":
            actionRequiredComponent = (
              <div>
                ACTION Required:{" "}
                <button onClick={editItemHandler} className="underline">
                  Edit this application
                </button>{" "}
                to add missing information and then click save.
              </div>
            );
            break;

          case "photo-required":
            actionRequiredComponent = <div>ACTION Required: Upload photo</div>;
            break;

          case "ready-to-submit":
            actionRequiredComponent = (
              <div>
                ACTION Required: If happy with your workforce application click{" "}
                <button onClick={submitItemHandler} className="underline">
                  Submit application
                </button>{" "}
                to send to Broadstairs Folk Week.
              </div>
            );
            break;
        }
      }

      return (
        <div
          className="flex flex-col bg-yellow-100 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => {
            editItemHandler();
          }}
        >
          <ApplicationHeader application={application}>
            {actionRequiredComponent}
          </ApplicationHeader>

          <div className="flex flex-row">
            <div className="p-4 overflow-hidden">
              <ApplicationInfo application={application} />
            </div>
            <div className="py-4 pr-2 w-40">{controlsComponent}</div>
          </div>

          <ApplicationFooter application={application} />
        </div>
      );
    } else {
      return (
        <div className="flex flex-col h-48 bg-yellow-50 rounded-lg overflow-hidden cursor-pointer text-center">
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

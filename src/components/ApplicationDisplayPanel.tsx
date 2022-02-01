import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApplication } from "./contexts/ApplicationContext";
import { useEditApplication } from "./contexts/EditApplicationContext";

const ApplicationDisplayPanel: React.FC = () => {
  const navigate = useNavigate();
  const { newApplication } = useEditApplication();
  const { loaded: applicationLoaded, application } = useApplication();

  const newApplicationHandler = useCallback(() => {
    newApplication();
    navigate("/application");
  }, [navigate, newApplication]);

  if (applicationLoaded) {
    if (application) {
      return <div>PLACEHOLDER</div>;
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

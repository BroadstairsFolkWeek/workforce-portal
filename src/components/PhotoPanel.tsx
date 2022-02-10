import { useEffect, useMemo } from "react";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import XHRUpload from "@uppy/xhr-upload";
import Webcam from "@uppy/webcam";

import { Panel, PanelType } from "@fluentui/react";

import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "@uppy/webcam/dist/style.css";

export interface PhotoPanelProps {
  onDismiss: () => void;
}

const PhotoPanel: React.FC<PhotoPanelProps> = ({ onDismiss }) => {
  const uppy = useMemo(() => {
    return new Uppy({
      meta: { type: "avatar" },
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ["image/jpeg", "image/png"],
      },
      autoProceed: false,
    })
      .use(Webcam, {
        modes: ["picture"],
        mirror: true,
        showVideoSourceDropdown: true,
        videoConstraints: {
          width: { min: 720, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 800, max: 1080 },
        },
      })
      .use(XHRUpload, {
        endpoint: "/api/profilePhoto",
        formData: true,
      });
  }, []);

  useEffect(() => {
    return () => uppy.close();
  }, [uppy]);

  return (
    <Panel
      headerText="Set your photo"
      isOpen={true}
      hasCloseButton={true}
      type={PanelType.medium}
      isLightDismiss
      onDismiss={onDismiss}
    >
      <Dashboard uppy={uppy} plugins={["Webcam"]} />
    </Panel>
  );
};

export default PhotoPanel;

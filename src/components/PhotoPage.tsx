import { useCallback, useEffect, useMemo } from "react";
import Uppy, { UploadResult } from "@uppy/core";
import { Dashboard } from "@uppy/react";
import XHRUpload from "@uppy/xhr-upload";
import Webcam from "@uppy/webcam";

import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "@uppy/webcam/dist/style.css";

import PageLayout from "./PageLayout";
import { useUserProfile } from "./contexts/UserProfileContext";
import { Profile } from "../../api/interfaces/profile";

export interface PhotoPanelProps {}

const PhotoPage: React.FC<PhotoPanelProps> = () => {
  const {
    injectProfileAndApplication,
    userProfile,
    loaded: profileLoaded,
  } = useUserProfile();

  const profileImage = useMemo(() => {
    if (profileLoaded && userProfile?.photoUrl) {
      return (
        <div className="">
          <p className="my-2">
            This is your current profile photo. We'll use it on you workforce ID
            badge.
          </p>
          <img alt="Profile" className="h-60" src={userProfile.photoUrl} />
          <p>
            You can change your profile photo by taking or uploading a new photo
            using the options below.
          </p>
        </div>
      );
    } else {
      return <p>You haven't set a profile photo yet.</p>;
    }
  }, [profileLoaded, userProfile]);

  const uploadCompleteHandler = useCallback(
    (result: UploadResult) => {
      console.log("Upload complete:", JSON.stringify(result, null, 2));
      if (result.successful.length) {
        const responseBody = result.successful[0].response?.body;
        if (responseBody) {
          injectProfileAndApplication(responseBody as Profile);
        }
      }
    },
    [injectProfileAndApplication]
  );

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
        formData: false,
      })
      .on("complete", uploadCompleteHandler);
  }, [uploadCompleteHandler]);

  useEffect(() => {
    return () => uppy.close();
  }, [uppy]);

  return (
    <PageLayout>
      <h1 className="text-2xl font-black">Profile photo</h1>

      {profileImage}
      <Dashboard uppy={uppy} plugins={["Webcam"]} height={350} />
    </PageLayout>
  );
};

export default PhotoPage;

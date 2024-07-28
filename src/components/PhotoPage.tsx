import { Schema } from "@effect/schema";
import { useCallback, useEffect, useMemo, useState } from "react";
import Uppy, { UploadResult } from "@uppy/core";
import { Dashboard } from "@uppy/react";
import XHRUpload from "@uppy/xhr-upload";
import Webcam from "@uppy/webcam";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/webcam/dist/style.min.css";

import { useDispatch, useSelector } from "react-redux";
import { selectProfile, setProfile } from "../features/profile/profile-slice";
import { UploadPhotoResponse } from "../api/interfaces/photo";
import { setForms } from "../features/forms/forms-slice";

export interface PhotoPanelProps {}

const PhotoPage: React.FC<PhotoPanelProps> = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const [uppy, setUppy] = useState<Uppy | null>(null);

  const profileImage = useMemo(() => {
    if (profile && profile.photoUrl) {
      return (
        <div className="">
          <p className="my-2">
            This is your current profile photo. We'll use it on you workforce ID
            badge.
          </p>
          <img alt="Profile" className="h-60" src={profile.photoUrl} />
          <p>
            You can change your profile photo by taking or uploading a new photo
            using the options below.
          </p>
        </div>
      );
    } else {
      return <p>You haven't set a profile photo yet.</p>;
    }
  }, [profile]);

  const uploadCompleteHandler = useCallback(
    (result: UploadResult) => {
      console.log("Upload complete:", JSON.stringify(result, null, 2));
      if (result.successful.length) {
        const responseBody = result.successful[0].response?.body;
        if (responseBody) {
          const photoUploadResponse =
            Schema.decodeUnknownSync(UploadPhotoResponse)(responseBody);
          dispatch(
            setProfile({
              profile: photoUploadResponse.data.profile,
              profileLoadingStatus: "loaded",
              profileLoadingError: "",
            })
          );
          dispatch(
            setForms({
              forms: photoUploadResponse.data.forms,
              creatableForms: photoUploadResponse.data.creatableForms,
            })
          );
        }
      }
    },
    [dispatch]
  );

  // Configure an Uppy instance for use by the Dashboard.
  useEffect(() => {
    const newUppy = new Uppy({
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

    setUppy(newUppy);

    return () => {
      newUppy.close();
      setUppy(null);
    };
  }, [uploadCompleteHandler]);

  // Do not render the component before the Uppy instance is created.
  if (!uppy) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-black">Profile photo</h1>

      {profileImage}
      <Dashboard
        uppy={uppy}
        plugins={["Webcam"]}
        height={400}
        disabled={false}
      />
    </div>
  );
};

export default PhotoPage;

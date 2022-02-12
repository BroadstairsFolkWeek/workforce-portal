import { useCallback, useEffect, useMemo, useState } from "react";
import Uppy, { UploadResult } from "@uppy/core";
import { Dashboard } from "@uppy/react";
import XHRUpload from "@uppy/xhr-upload";
import Webcam from "@uppy/webcam";

import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "@uppy/webcam/dist/style.css";
import { useUserProfilePhotos } from "./contexts/UserProfilePhotosContext";

import hoodenHorse from "../images/hoodenHorse.jpg";
import Spinner from "./Spinner";
import PageLayout from "./PageLayout";
import { useUserProfile } from "./contexts/UserProfileContext";
import { UserLogin } from "../../api/interfaces/user-login";
import { Application } from "../../api/interfaces/application";

export interface PhotoPanelProps {}

const PhotoPage: React.FC<PhotoPanelProps> = () => {
  const {
    loaded,
    profilePhotoDataSrc,
    previousPhotosDataSrc,
    loadPreviousPhotos,
    deletePhoto,
    setProfilePhoto,
  } = useUserProfilePhotos();

  const { injectProfileAndApplication } = useUserProfile();

  const [deleting, setDeleting] = useState(false);

  const onDeleteClicked = useCallback(() => {
    if (!deleting) {
      setDeleting(true);
      deletePhoto();
      setDeleting(false);
    }
  }, [deleting, deletePhoto]);

  const profileImage = useMemo(() => {
    if (loaded && profilePhotoDataSrc) {
      return (
        <div className="">
          <p className="my-2">
            This is your current profile photo. We'll use it on you workforce ID
            badge.
          </p>{" "}
          <img alt="Profile" className="h-60" src={profilePhotoDataSrc} />
          <button
            disabled={deleting}
            className="m-2 w-24 p-2 bg-bfw-yellow hover:bg-bfw-link rounded text-lg text-menu-text disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none"
            onClick={onDeleteClicked}
          >
            Delete
          </button>
        </div>
      );
    } else {
      return <p>You haven't set a profile photo yet.</p>;
    }
  }, [deleting, loaded, profilePhotoDataSrc, onDeleteClicked]);

  const previousProfileImages = useMemo(() => {
    if (
      previousPhotosDataSrc &&
      previousPhotosDataSrc.length &&
      previousPhotosDataSrc[0]
    ) {
      const imagesElements = previousPhotosDataSrc.map((datasrc, index) => {
        return datasrc ? (
          <img
            alt="Archived"
            className="h-16"
            key={index}
            src={datasrc ? datasrc : hoodenHorse}
          />
        ) : (
          <Spinner key={index} size="sm" />
        );
      });
      return (
        <div>
          <p className="my-2">
            We keep a few of you most recently uploaded profile images. Your
            most recenty uploaded image (shown) above is automatically used as
            your profile image.
          </p>
          <p className="my-2">
            If you delete the above image then the most recent of these
            following images will become your profile image.
          </p>
          <div className="flex gap-2 my-2">{imagesElements}</div>
        </div>
      );
    } else {
      return null;
    }
  }, [previousPhotosDataSrc]);

  const uploadCompleteHandler = useCallback(
    (result: UploadResult) => {
      console.log("Upload complete:", JSON.stringify(result, null, 2));
      if (result.successful.length) {
        const previewUrl = result.successful[0].preview as string;
        setProfilePhoto(previewUrl);
        const responseBody = result.successful[0].response?.body;
        if (responseBody) {
          injectProfileAndApplication(
            responseBody.profile as UserLogin,
            responseBody.application as Application
          );
        }
      }
    },
    [setProfilePhoto, injectProfileAndApplication]
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
        formData: true,
      })
      .on("complete", uploadCompleteHandler);
  }, [uploadCompleteHandler]);

  useEffect(() => {
    return () => uppy.close();
  }, [uppy]);

  useEffect(() => {
    if (loaded) {
      loadPreviousPhotos();
    }
  }, [loaded, loadPreviousPhotos]);

  return (
    <PageLayout>
      <h1 className="text-2xl font-black">Profile photo</h1>

      {profileImage}
      {previousProfileImages}
      <Dashboard uppy={uppy} plugins={["Webcam"]} height={350} />
    </PageLayout>
  );
};

export default PhotoPage;

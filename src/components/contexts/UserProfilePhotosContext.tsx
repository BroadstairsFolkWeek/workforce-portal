import React, { useCallback, useContext, useEffect, useState } from "react";
import { useUserProfile } from "./UserProfileContext";

export type IUserProfilePhotosContext = {
  loaded: boolean;
  photoUploaded: boolean;
  profilePhotoDataSrc: string | null;
  previousPhotosDataSrc: Array<string | null>;
  reload: () => void;
  loadPreviousPhotos: () => void;
  deletePhoto: () => void;
  setProfilePhoto: (urlObject: string) => void;
};

const invalidFunction = () => {
  throw new Error(
    "UserProfilePhotosContext consumer is not wrapped in a corresponding provider."
  );
};

const UserProfilePhotosContext = React.createContext<IUserProfilePhotosContext>(
  {
    loaded: false,
    photoUploaded: false,
    profilePhotoDataSrc: null,
    previousPhotosDataSrc: [],
    reload: invalidFunction,
    loadPreviousPhotos: invalidFunction,
    deletePhoto: invalidFunction,
    setProfilePhoto: invalidFunction,
  }
);

const UserProfilePhotosContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const { loaded: userProfileLoaded, userProfile } = useUserProfile();
  const [loaded, setLoaded] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [previousPhotosLoaded, setPreviousPhotosLoaded] = useState(false);
  const [profilePhotoDataSrc, setProfilePhotoDataSrc] = useState<string | null>(
    null
  );
  const [previousPhotosDataSrc, setPreviousPhotosDataSrc] = useState<
    Array<string | null>
  >([]);

  const fetchPhoto = useCallback(async (id: string) => {
    const fetchResponse = await fetch(`/api/profilePhoto?id=${id}`);
    if (fetchResponse.ok) {
      const blob = await fetchResponse.blob();
      const url = URL.createObjectURL(blob);
      return url;
    }
  }, []);

  const fetchPreviousPhotos = useCallback(async () => {
    setPreviousPhotosDataSrc([null]);
    if (userProfile && userProfile.photoIds.length > 1) {
      const prevPhotoIds = userProfile.photoIds.slice(1);
      setPreviousPhotosDataSrc(Array(prevPhotoIds.length));
      prevPhotoIds.forEach((prevPhotoId, index) => {
        fetchPhoto(prevPhotoId).then((photoUrlObject) => {
          setPreviousPhotosDataSrc((prev) => {
            if (photoUrlObject) {
              const newPreviousPhotos = [...prev];
              newPreviousPhotos[index] = photoUrlObject;
              return newPreviousPhotos;
            } else {
              return prev;
            }
          });
        });
      });
    }
  }, [userProfile, fetchPhoto]);

  const reload = useCallback(async () => {
    if (userProfile && userProfile.photoIds.length > 0) {
      setLoaded(false);
      setPhotoUploaded(false);
      setProfilePhotoDataSrc(null);
      const urlObject = await fetchPhoto(userProfile.photoIds[0]);
      if (urlObject) {
        setProfilePhotoDataSrc(urlObject);
        setPhotoUploaded(true);
      }
      setLoaded(true);
    }
  }, [userProfile, fetchPhoto]);

  const loadPreviousPhotos = useCallback(async () => {
    if (!previousPhotosLoaded) {
      setPreviousPhotosLoaded(true);
      fetchPreviousPhotos();
    }
  }, [previousPhotosLoaded, fetchPreviousPhotos]);

  const deletePhoto = useCallback(async () => {
    const fetchResponse = await fetch(`/api/profilePhoto`, {
      method: "DELETE",
    });
    if (fetchResponse.ok) {
      if (
        previousPhotosDataSrc &&
        previousPhotosDataSrc.length &&
        previousPhotosDataSrc[0]
      ) {
        setProfilePhotoDataSrc(previousPhotosDataSrc[0]);
        setPreviousPhotosDataSrc((prev) => {
          const newPrev = [...prev];
          newPrev.shift();
          return newPrev;
        });
      } else {
        setProfilePhotoDataSrc(null);
      }
    }
  }, [previousPhotosDataSrc]);

  const setProfilePhoto = useCallback(
    (urlObject: string) => {
      setProfilePhotoDataSrc(urlObject);
      setPhotoUploaded(true);
      fetchPreviousPhotos();
    },
    [fetchPreviousPhotos]
  );

  useEffect(() => {
    if (userProfileLoaded) {
      reload();
    }
  }, [userProfileLoaded, userProfile, reload]);

  return (
    <UserProfilePhotosContext.Provider
      value={{
        loaded,
        photoUploaded,
        profilePhotoDataSrc,
        previousPhotosDataSrc,
        reload,
        loadPreviousPhotos,
        deletePhoto,
        setProfilePhoto,
      }}
    >
      {children}
    </UserProfilePhotosContext.Provider>
  );
};

const useUserProfilePhotos = () => useContext(UserProfilePhotosContext);

export { UserProfilePhotosContextProvider, useUserProfilePhotos };

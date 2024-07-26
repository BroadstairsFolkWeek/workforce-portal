import { useDispatch, useSelector } from "react-redux";
import {
  saveProfile as actionSaveProfile,
  selectProfile,
} from "../features/profile/profile-slice";

import { useCallback } from "react";
import { AppDispatch } from "../store";
import { useNavigate } from "react-router-dom";
import { ProfileUpdate } from "../interfaces/profile";

export const useProfileHandlers = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector(selectProfile);

  const navigateHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const editProfile = useCallback(() => {
    navigate(`/profile`);
  }, [navigate]);

  const saveProfile = useCallback(
    async (profileUpdates: ProfileUpdate) => {
      dispatch(
        actionSaveProfile({
          updates: profileUpdates,
          version: profile?.version ?? 0,
        })
      );

      navigateHome();
    },
    [dispatch, navigateHome, profile?.version]
  );

  const cancelEditProfile = useCallback(() => {
    navigateHome();
  }, [navigateHome]);

  return {
    navigateHome,
    editProfile,
    saveProfile,
    cancelEditProfile,
  } as const;
};

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ContextualMenuItemType,
  DefaultButton,
  IButtonStyles,
  IContextualMenuProps,
  IContextualMenuStyleProps,
  IContextualMenuStyles,
  IStyleFunctionOrObject,
} from "@fluentui/react";

import { useSelector } from "react-redux";
import {
  selectProfile,
  selectProfileLoadingError,
  selectProfileLoadingStatus,
} from "../features/profile/profile-slice";

const buttonStyles: IButtonStyles = {
  root: { height: "unset", backgroundColor: "#00000000", color: "#F6C70B" },
  rootHovered: { backgroundColor: "#F6C70B", color: "#000000FF" },
  rootFocused: { backgroundColor: "#F6C70B", color: "#000000FF" },
  rootPressed: { backgroundColor: "#F6C70B", color: "#000000FF" },
  rootExpanded: { backgroundColor: "#F6C70B", color: "#000000FF" },
};

const contextMenuStyles: IStyleFunctionOrObject<
  IContextualMenuStyleProps,
  IContextualMenuStyles
> = {
  root: {},
};

const ProfileControl: React.FC = () => {
  const navigate = useNavigate();

  const profile = useSelector(selectProfile);
  const profileStatus = useSelector(selectProfileLoadingStatus);
  const profileError = useSelector(selectProfileLoadingError);

  const profileImage = useMemo(() => {
    if (profile) {
      return (
        <img
          alt="Profile"
          className="h-10"
          src={
            profile?.metadata.photoUrl
              ? profile.metadata.photoUrl
              : "/hoodenHorse.jpg"
          }
        />
      );
    } else {
      return null;
    }
  }, [profile]);

  const menuProps = useMemo<IContextualMenuProps>(
    () => ({
      styles: contextMenuStyles,
      items: [
        {
          key: "editProfile",
          text: "Edit profile",
          onClick: () => navigate("/profile"),
        },
        {
          key: "setPhoto",
          text: "Set photo",
          onClick: () => navigate("/profilePhoto"),
        },
        { key: "divider_1", itemType: ContextualMenuItemType.Divider },
        { key: "signOut", text: "Sign out", href: "/api/logout" },
      ],
    }),
    [navigate]
  );

  switch (profileStatus) {
    case "not-authenticated":
      return (
        <a className="m-1 p-1 text-bfw-link" href="/.auth/login/bcauth">
          Sign In or Create Account
        </a>
      );

    case "loading":
      return (
        <p className="text-bfw-link animate-pulse">
          Checking authentication...
        </p>
      );

    case "loaded":
      if (profile) {
        return (
          <div className="flex justify-end gap-2">
            <DefaultButton
              text={profile.displayName}
              menuProps={menuProps}
              styles={buttonStyles}
            />
            {profileImage}
          </div>
        );
      }
      break;

    case "error":
      return (
        <p className="text-bfw-link animate-pulse">
          Error when checking authentication. Please refresh and try again.
          {profileError}
        </p>
      );
  }
};

export default ProfileControl;

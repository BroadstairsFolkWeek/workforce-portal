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

import { useUserProfile } from "./contexts/UserProfileContext";

import hoodenHorse from "../images/hoodenHorse.jpg";

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
  const { loaded, userProfile } = useUserProfile();

  const profileImage = useMemo(() => {
    return (
      <img
        alt="Profile"
        className="h-10"
        src={userProfile?.photoUrl ? userProfile.photoUrl : hoodenHorse}
      />
    );
  }, [userProfile]);

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

  if (loaded) {
    if (userProfile) {
      return (
        <div className="flex justify-end gap-2">
          <DefaultButton
            text={userProfile.displayName}
            menuProps={menuProps}
            styles={buttonStyles}
          />
          {profileImage}
        </div>
      );
    } else {
      return (
        <a className="m-1 p-1 text-bfw-link" href="/.auth/login/b2cauth">
          Sign In or Create Account
        </a>
      );
    }
  } else {
    return (
      <p className="text-bfw-link animate-pulse">Checking authentication...</p>
    );
  }
};

export default ProfileControl;

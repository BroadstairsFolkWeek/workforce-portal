import { useMemo, useState } from "react";
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
import PhotoPanel from "./PhotoPanel";
import ProfilePanel from "./ProfilePanel";

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
  const { loaded, userProfile } = useUserProfile();
  const [showProfilePanel, setShowProfilePanel] = useState<boolean>(false);
  const [showPhotoPanel, setShowPhotoPanel] = useState<boolean>(false);

  const menuProps = useMemo<IContextualMenuProps>(
    () => ({
      styles: contextMenuStyles,
      items: [
        {
          key: "editProfile",
          text: "Edit profile",
          onClick: () => setShowProfilePanel(true),
        },
        {
          key: "setPhoto",
          text: "Set photo",
          onClick: () => setShowPhotoPanel(true),
        },
        { key: "divider_1", itemType: ContextualMenuItemType.Divider },
        { key: "signOut", text: "Sign out", href: "/api/logout" },
      ],
    }),
    []
  );

  const panel = useMemo(() => {
    if (showProfilePanel) {
      return <ProfilePanel onDismiss={() => setShowProfilePanel(false)} />;
    } else if (showPhotoPanel) {
      return <PhotoPanel onDismiss={() => setShowPhotoPanel(false)} />;
    } else {
      return null;
    }
  }, [showProfilePanel, showPhotoPanel]);

  if (loaded) {
    if (userProfile) {
      return (
        <>
          <DefaultButton
            text={userProfile.displayName}
            menuProps={menuProps}
            styles={buttonStyles}
          />
          {panel}
        </>
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

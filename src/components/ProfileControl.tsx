import {
  ContextualMenuItemType,
  DefaultButton,
  IButtonStyles,
  IContextualMenuProps,
  IContextualMenuStyleProps,
  IContextualMenuStyles,
  IStyleFunctionOrObject,
} from "@fluentui/react";
import { useMemo, useState } from "react";
import { useUserProfile } from "./contexts/UserProfileContext";
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

  const menuProps = useMemo<IContextualMenuProps>(
    () => ({
      styles: contextMenuStyles,
      items: [
        {
          key: "editProfile",
          text: "Edit profile",
          onClick: () => setShowProfilePanel(true),
        },
        { key: "divider_1", itemType: ContextualMenuItemType.Divider },
        { key: "signOut", text: "Sign out", href: "/api/logout" },
      ],
    }),
    []
  );

  const profilePanel = useMemo(() => {
    if (showProfilePanel) {
      return <ProfilePanel onDismiss={() => setShowProfilePanel(false)} />;
    } else {
      return null;
    }
  }, [showProfilePanel]);

  if (loaded) {
    if (userProfile) {
      return (
        <>
          <DefaultButton
            text={userProfile.displayName}
            menuProps={menuProps}
            styles={buttonStyles}
          />
          {profilePanel}
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

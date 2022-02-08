import { Panel, PanelType } from "@fluentui/react";
import ProfileForm from "./forms/ProfileForm";

export interface ProfilePanelProps {
  onDismiss: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ onDismiss }) => {
  return (
    <Panel
      headerText="Modify your profile"
      isOpen={true}
      hasCloseButton={true}
      type={PanelType.smallFixedFar}
      isLightDismiss
      onDismiss={onDismiss}
    >
      <ProfileForm onSaved={onDismiss} onCancel={onDismiss} />
    </Panel>
  );
};

export default ProfilePanel;

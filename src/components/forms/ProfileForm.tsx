import { useCallback, useMemo, useState } from "react";
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  IDialogContentProps,
  PrimaryButton,
} from "@fluentui/react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { ContrastDark } from "survey-core/themes";

import { Profile, ProfileUpdate } from "../../interfaces/profile";
import { useProfileHandlers } from "../../routes/ProfileHandlers";

import formJson from "./profile-form.json?json";

import "survey-core/defaultV2.min.css";

export interface ProfileFormProps {
  profile: Profile;
}

const deleteDialogContentProps: IDialogContentProps = {
  type: DialogType.normal,
  title: "Delete your profile?",
  closeButtonAriaLabel: "Close",
};

const dialogStyles = { main: { maxWidth: 450 } };

const modalProps = {
  isBlocking: false,
  styles: dialogStyles,
  dragOptions: undefined,
};

const ProfileForm: React.FC<ProfileFormProps> = ({ profile }) => {
  const { saveProfile } = useProfileHandlers();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveProfileHandler = useCallback(
    async (answers: unknown) => {
      saveProfile(answers as ProfileUpdate);
    },
    [saveProfile]
  );

  const survey = new Model(formJson);
  survey.data = profile;
  survey.applyTheme(ContrastDark);
  survey.validate();

  survey.onComplete.add((sender) => saveProfileHandler(sender.data));

  const messageBoxElement = useMemo(() => {
    if (confirmDelete) {
      return (
        <Dialog
          hidden={false}
          onDismiss={() => setConfirmDelete(false)}
          dialogContentProps={deleteDialogContentProps}
          modalProps={modalProps}
        >
          <p className="mb-4">
            This will remove all your information from the workforce portal.
          </p>

          <p className="mb-4">
            Additionaly, if you have already submitted forms to Broadstairs Folk
            Week which subsequently been accepted, you may want to contact
            Broadstairs Folk Week directly to withdraw those forms.
          </p>

          <p>
            Would you like to delete your information from the workforce portal?
          </p>
          <DialogFooter>
            <PrimaryButton
              onClick={() => (window.location.pathname = "/api/deleteUser")}
              text="Delete"
            />
            <DefaultButton
              onClick={() => setConfirmDelete(false)}
              text="Cancel"
            />
          </DialogFooter>
        </Dialog>
      );
    } else {
      return null;
    }
  }, [confirmDelete]);

  const preFooter = useMemo(
    () => (
      <div className="px-2 text-right">
        <button
          onClick={() => setConfirmDelete(true)}
          disabled={confirmDelete}
          className="m-1 p-4 bg-red-300 hover:bg-red-500 rounded text-lg text-menu-text "
        >
          Delete my information
        </button>
      </div>
    ),
    [confirmDelete]
  );

  if (!profile) {
    return <h1>Not signed in</h1>;
  }

  return (
    <div>
      <h1 className="text-2xl font-black">Modify your profile</h1>
      <Survey model={survey} />
    </div>
  );
};

export default ProfileForm;

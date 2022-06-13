import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  IDialogContentProps,
  PrimaryButton,
} from "@fluentui/react";
import { useCallback, useMemo, useState } from "react";
import { Application } from "../interfaces/application";

interface ApplicationControlsProps {
  application: Application;
  editButtonClicked: () => void;
  deleteButtonClicked: () => void;
  uploadDocumentsButtonClicked: () => void;
  applicationSubmitButtonClcked: () => void;
  retractButtonClicked: () => void;
}

const deleteDialogContentProps: IDialogContentProps = {
  type: DialogType.normal,
  title: "Delete this application?",
  closeButtonAriaLabel: "Close",
};

const retractDialogContentProps: IDialogContentProps = {
  type: DialogType.normal,
  isMultiline: true,
  title: "Edit/Retract this application?",
  closeButtonAriaLabel: "Close",
};

const dialogStyles = { main: { maxWidth: 450 } };

const modalProps = {
  isBlocking: false,
  styles: dialogStyles,
  dragOptions: undefined,
};

const isEditable = (application: Application): boolean => {
  return (
    application.status !== "submitted" && application.status !== "complete"
  );
};

const isDeletable = (application: Application): boolean => {
  return true;
};

const isDocumentsUploadable = (application: Application): boolean => {
  return application.status === "documents-required";
};

const isSubmittable = (application: Application): boolean => {
  return application.status === "ready-to-submit";
};

const isRetractable = (application: Application): boolean => {
  return application.status === "submitted";
};

interface ControlsButtonProps {
  text: string;
  className: string;
  onClicked: () => void;
}

const ControlsButton: React.FC<ControlsButtonProps> = ({
  text,
  className,
  onClicked,
}) => {
  const buttonClickedHander: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (ev) => {
        ev.stopPropagation();
        onClicked();
      },
      [onClicked]
    );

  return (
    <button
      onClick={buttonClickedHander}
      className={`w-full py-2 self-center rounded-full ${className}`}
    >
      {text}
    </button>
  );
};

const ApplicationControls = ({
  application,
  editButtonClicked,
  deleteButtonClicked,
  uploadDocumentsButtonClicked,
  applicationSubmitButtonClcked,
  retractButtonClicked,
}: ApplicationControlsProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRetract, setConfirmRetract] = useState(false);

  const editElement = useMemo(
    () =>
      isEditable(application) ? (
        <ControlsButton
          text="Edit"
          className="bg-yellow-400"
          onClicked={editButtonClicked}
        />
      ) : null,
    [application, editButtonClicked]
  );

  const deleteElement = useMemo(
    () =>
      isDeletable(application) ? (
        <ControlsButton
          text="Delete"
          className="bg-red-400"
          onClicked={() => setConfirmDelete(true)}
        />
      ) : null,
    [application]
  );

  const uploadElement = useMemo(
    () =>
      isDocumentsUploadable(application) ? (
        <ControlsButton
          text="Upload Documents"
          className="bg-green-400"
          onClicked={uploadDocumentsButtonClicked}
        />
      ) : null,
    [application, uploadDocumentsButtonClicked]
  );

  const submitElement = useMemo(
    () =>
      isSubmittable(application) ? (
        <ControlsButton
          text="Submit application"
          className="bg-blue-300"
          onClicked={applicationSubmitButtonClcked}
        />
      ) : null,
    [application, applicationSubmitButtonClcked]
  );

  const retractElement = useMemo(
    () =>
      isRetractable(application) ? (
        <ControlsButton
          text="Edit/Retract application"
          className="bg-yellow-400"
          onClicked={() => setConfirmRetract(true)}
        />
      ) : null,
    [application]
  );

  const messageBoxElement = useMemo(() => {
    if (confirmDelete) {
      return (
        <Dialog
          hidden={false}
          onDismiss={() => setConfirmDelete(false)}
          dialogContentProps={deleteDialogContentProps}
          modalProps={modalProps}
        >
          <DialogFooter>
            <PrimaryButton onClick={deleteButtonClicked} text="Delete" />
            <DefaultButton
              onClick={() => setConfirmDelete(false)}
              text="Cancel"
            />
          </DialogFooter>
        </Dialog>
      );
    } else if (confirmRetract) {
      return (
        <Dialog
          hidden={false}
          onDismiss={() => setConfirmRetract(false)}
          dialogContentProps={retractDialogContentProps}
          modalProps={modalProps}
        >
          <p className="mb-4">
            This will allow you to make changes to your application, or even
            withdraw it completely.
          </p>

          <p>
            Broadstairs Folk Week will not process your application until you
            submit it again.
          </p>
          <DialogFooter>
            <PrimaryButton onClick={retractButtonClicked} text="Edit/Retract" />
            <DefaultButton
              onClick={() => setConfirmRetract(false)}
              text="Cancel"
            />
          </DialogFooter>
        </Dialog>
      );
    } else {
      return null;
    }
  }, [
    confirmDelete,
    confirmRetract,
    deleteButtonClicked,
    retractButtonClicked,
  ]);

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        {editElement}
        {deleteElement}
        {uploadElement}
        {submitElement}
        {retractElement}
        {messageBoxElement}
      </div>
    </>
  );
};

export default ApplicationControls;

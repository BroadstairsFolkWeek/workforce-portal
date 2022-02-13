import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
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
}

const dialogContentProps = {
  type: DialogType.normal,
  title: "Delete this application?",
  closeButtonAriaLabel: "Close",
};

const dialogStyles = { main: { maxWidth: 450 } };

const modalProps = {
  isBlocking: false,
  styles: dialogStyles,
  dragOptions: undefined,
};

const isEditable = (application: Application): boolean => {
  return application.status !== "complete";
};

const isDeletable = (application: Application): boolean => {
  return application.status !== "complete";
};

const isDocumentsUploadable = (application: Application): boolean => {
  return application.status === "documents-required";
};

const isSubmittable = (application: Application): boolean => {
  return application.status === "ready-to-submit";
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
}: ApplicationControlsProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const completeElement = useMemo(
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

  const messageBoxElement = useMemo(
    () =>
      confirmDelete ? (
        <div>
          <Dialog
            hidden={false}
            onDismiss={() => setConfirmDelete(false)}
            dialogContentProps={dialogContentProps}
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
        </div>
      ) : null,
    [confirmDelete, deleteButtonClicked]
  );

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        {editElement}
        {deleteElement}
        {uploadElement}
        {completeElement}
        {messageBoxElement}
      </div>
    </>
  );
};

export default ApplicationControls;

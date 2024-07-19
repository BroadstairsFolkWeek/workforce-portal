import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  IDialogContentProps,
  PrimaryButton,
} from "@fluentui/react";
import { useCallback, useMemo, useState } from "react";
import { FormSubmission } from "../interfaces/form";
import { NavLink } from "react-router-dom";

interface FormSubmissionControlsProps {
  formSubmission: FormSubmission;
  inhibitViewControl?: boolean;
  submitForm: () => void;
  retractForm: () => void;
  deleteForm: () => void;
}

const deleteDialogContentProps: IDialogContentProps = {
  type: DialogType.normal,
  title: "Delete this form?",
  closeButtonAriaLabel: "Close",
};

const retractDialogContentProps: IDialogContentProps = {
  type: DialogType.normal,
  isMultiline: true,
  title: "Edit/Retract this form?",
  closeButtonAriaLabel: "Close",
};

const dialogStyles = { main: { maxWidth: 450 } };

const modalProps = {
  isBlocking: false,
  styles: dialogStyles,
  dragOptions: undefined,
};

const isEditable = (formSubmission: FormSubmission): boolean =>
  formSubmission.submissionStatus === "draft" ||
  formSubmission.submissionStatus === "submittable";

const isSubmittable = (formSubmission: FormSubmission): boolean =>
  formSubmission.submissionStatus === "submittable";

const isRetractable = (formSubmission: FormSubmission): boolean =>
  formSubmission.submissionStatus === "submitted";

interface ControlsButtonProps {
  text: string;
  className: string;
  onClicked: () => void;
}

interface ControlsLinkProps {
  text: string;
  className: string;
  href: string;
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

const ControlsLink: React.FC<ControlsLinkProps> = ({
  text,
  className,
  href,
}) => {
  return (
    <NavLink
      to={href}
      className={`w-full py-2 self-center rounded-full ${className}`}
    >
      {text}
    </NavLink>
  );
};

const FormSubmissionControls = ({
  formSubmission,
  inhibitViewControl = false,
  submitForm: submitButtonClicked,
  retractForm: retractButtonClicked,
  deleteForm: deleteButtonClicked,
}: FormSubmissionControlsProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRetract, setConfirmRetract] = useState(false);

  const viewElement = useMemo(() => {
    if (inhibitViewControl) {
      return null;
    }
    return (
      <ControlsLink
        text="View"
        className="bg-green-400"
        href={`/formSubmissions/${formSubmission.id}`}
      />
    );
  }, [formSubmission, inhibitViewControl]);

  const editElement = useMemo(
    () =>
      isEditable(formSubmission) ? (
        <ControlsLink
          text="Edit"
          className="bg-yellow-400"
          href={`/formSubmissions/${formSubmission.id}/edit`}
        />
      ) : null,
    [formSubmission]
  );

  const deleteElement = useMemo(
    () => (
      <ControlsButton
        text="Delete"
        className="bg-red-400"
        onClicked={() => setConfirmDelete(true)}
      />
    ),
    [formSubmission]
  );

  const submitElement = useMemo(
    () =>
      isSubmittable(formSubmission) ? (
        <ControlsButton
          text="Submit form"
          className="bg-blue-300"
          onClicked={submitButtonClicked}
        />
      ) : null,
    [formSubmission, submitButtonClicked]
  );

  const retractElement = useMemo(
    () =>
      isRetractable(formSubmission) ? (
        <ControlsButton
          text="Edit/Retract form"
          className="bg-yellow-400"
          onClicked={() => setConfirmRetract(true)}
        />
      ) : null,
    [formSubmission]
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
            This will allow you to make changes to your form, or even withdraw
            it completely.
          </p>

          <p>
            Broadstairs Folk Week will not process your form until you submit it
            again.
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
        {viewElement}
        {editElement}
        {deleteElement}
        {submitElement}
        {retractElement}
        {messageBoxElement}
      </div>
    </>
  );
};

export default FormSubmissionControls;

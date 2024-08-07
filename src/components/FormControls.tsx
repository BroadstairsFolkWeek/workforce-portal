import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  IDialogContentProps,
  PrimaryButton,
} from "@fluentui/react";
import { useCallback, useMemo, useState } from "react";
import { Form } from "../interfaces/form";

interface FormControlsProps {
  form: Form;
  inhibitViewControl?: boolean;
  viewForm: () => void;
  editForm: () => void;
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

const isEditable = (form: Form): boolean =>
  form.answersModifiable === "modifiable";

const isDeletable = (form: Form): boolean =>
  form.submissionDeletable === "deletable";

const isSubmittable = (form: Form): boolean =>
  form.submissionStatus === "submittable";

const isRetractable = (form: Form): boolean =>
  form.submissionStatus === "submitted";

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

const FormControls = ({
  form,
  inhibitViewControl = false,
  viewForm,
  editForm,
  submitForm: submitButtonClicked,
  retractForm: retractButtonClicked,
  deleteForm: deleteButtonClicked,
}: FormControlsProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRetract, setConfirmRetract] = useState(false);

  const viewElement = useMemo(() => {
    if (inhibitViewControl) {
      return null;
    }
    return (
      <ControlsButton
        text="View"
        className="bg-green-400"
        onClicked={viewForm}
      />
    );
  }, [form, inhibitViewControl]);

  const editElement = useMemo(
    () =>
      isEditable(form) ? (
        <ControlsButton
          text="Edit"
          className="bg-yellow-400"
          onClicked={editForm}
        />
      ) : null,
    [form]
  );

  const deleteElement = useMemo(
    () =>
      isDeletable(form) ? (
        <ControlsButton
          text="Delete"
          className="bg-red-400"
          onClicked={() => setConfirmDelete(true)}
        />
      ) : null,
    [form]
  );

  const submitElement = useMemo(
    () =>
      isSubmittable(form) ? (
        <ControlsButton
          text="Submit form"
          className="bg-blue-300"
          onClicked={submitButtonClicked}
        />
      ) : null,
    [form, submitButtonClicked]
  );

  const retractElement = useMemo(
    () =>
      isRetractable(form) ? (
        <ControlsButton
          text="Edit/Retract form"
          className="bg-yellow-400"
          onClicked={() => setConfirmRetract(true)}
        />
      ) : null,
    [form]
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
            <PrimaryButton
              onClick={() => {
                setConfirmDelete(false);
                deleteButtonClicked();
              }}
              text="Delete"
            />
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

export default FormControls;

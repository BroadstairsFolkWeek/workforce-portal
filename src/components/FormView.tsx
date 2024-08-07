import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { Form } from "../interfaces/form";
import { ContrastDark } from "survey-core/themes";

import "survey-core/defaultV2.min.css";
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  IDialogContentProps,
  PrimaryButton,
} from "@fluentui/react";
import { useCallback, useMemo, useState } from "react";
import { useFormHandlers } from "../routes/FormHandlers";

interface FormViewProps {
  form: Form;
  editButtonClicked: () => void;
  submitButtonClicked: () => void;
  retractButtonClicked: () => void;
  deleteButtonClicked: () => void;
}

interface FormViewControlsProps {
  form: Form;
  editButtonClicked: () => void;
  submitButtonClicked: () => void;
  retractButtonClicked: () => void;
  deleteButtonClicked: () => void;
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
  form.submissionStatus === "draft" || form.submissionStatus === "submittable";

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

const FormViewControls = ({
  form,
  editButtonClicked,
  submitButtonClicked,
  retractButtonClicked,
  deleteButtonClicked,
}: FormViewControlsProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRetract, setConfirmRetract] = useState(false);

  const editElement = useMemo(
    () =>
      isEditable(form) ? (
        <ControlsButton
          text="Edit"
          className="bg-yellow-400"
          onClicked={editButtonClicked}
        />
      ) : null,
    [form, editButtonClicked]
  );

  const deleteElement = useMemo(
    () => (
      <ControlsButton
        text="Delete"
        className="bg-red-400"
        onClicked={() => setConfirmDelete(true)}
      />
    ),
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
        {editElement}
        {deleteElement}
        {submitElement}
        {retractElement}
        {messageBoxElement}
      </div>
    </>
  );
};

const FormView: React.FC<FormViewProps> = ({ form: form }) => {
  const { editForm, submitForm, retractForm, deleteForm } = useFormHandlers();

  const editFormHandler = useCallback(() => {
    editForm(form);
  }, [editForm, form]);

  const submitFormHandler = useCallback(async () => {
    await submitForm(form);
  }, [submitForm, form]);

  const retractFormHandler = useCallback(async () => {
    await retractForm(form);
    editForm(form);
  }, [retractForm, editForm, form]);

  const deleteFormHandler = useCallback(async () => {
    await deleteForm(form);
  }, [deleteForm, form]);

  const survey = new Model(form.template.questions);
  survey.data = form.answers;
  survey.applyTheme(ContrastDark);
  survey.mode = "display";

  if (!survey) {
    console.log("No survey model");
    return null;
  }

  return (
    <div>
      <FormViewControls
        form={form}
        editButtonClicked={editFormHandler}
        submitButtonClicked={submitFormHandler}
        retractButtonClicked={retractFormHandler}
        deleteButtonClicked={deleteFormHandler}
      />
      <Survey model={survey} />
    </div>
  );
};

export default FormView;

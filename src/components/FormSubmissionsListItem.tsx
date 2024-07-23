import { PropsWithChildren, useCallback } from "react";
import { FormSubmission } from "../interfaces/form";
import { DateTime } from "luxon";
import FormSubmissionControls from "./FormSubmissionControls";
import { useFormSubmissionHandlers } from "../routes/FormSubmissionHandlers";

interface FormSubmissionListItemProps {
  formSubmission: FormSubmission;
}

const ListItemHeader = ({
  formSubmission,
  children,
}: PropsWithChildren<{
  formSubmission: FormSubmission;
}>) => {
  return (
    <div className="bg-bfw-yellow">
      <div className="flex flex-row justify-between p-2 bg-bfw-yellow ">
        <div>{formSubmission.formSpec.fullName}</div>
        <div className="text-xs">{formSubmission.submissionStatus}</div>
      </div>
      <div className="px-2">{children}</div>
    </div>
  );
};

const ListItemFooter = ({
  children,
}: PropsWithChildren<{
  formSubmission: FormSubmission;
}>) => {
  return (
    <div className="bg-bfw-yellow">
      <div className="flex flex-col justify-between p-2 bg-black text-xs text-white">
        <div>TODO</div>
      </div>
      <div className="px-2">{children}</div>
    </div>
  );
};

const FormSubmissionListItem: React.FC<FormSubmissionListItemProps> = ({
  formSubmission,
}) => {
  const { viewForm, editForm, submitForm, retractForm, deleteForm } =
    useFormSubmissionHandlers();

  const viewFormHandler = useCallback(() => {
    viewForm(formSubmission);
  }, [viewForm, formSubmission]);

  const editFormHandler = useCallback(() => {
    editForm(formSubmission);
  }, [editForm, formSubmission]);

  const submitFormHandler = useCallback(async () => {
    await submitForm(formSubmission);
  }, [submitForm, formSubmission]);

  const retractFormHandler = useCallback(async () => {
    await retractForm(formSubmission);
    editForm(formSubmission);
  }, [retractForm, editForm, formSubmission]);

  const deleteFormHandler = useCallback(async () => {
    await deleteForm(formSubmission);
  }, [deleteForm, formSubmission]);

  return (
    <div className="flex flex-col bg-yellow-100 rounded-lg overflow-hidden">
      <ListItemHeader formSubmission={formSubmission} />

      <div className="flex flex-row">
        <div className="p-4 flex-grow overflow-hidden">
          <div className="text-sm">
            Last saved:{" "}
            {DateTime.fromISO(
              formSubmission.modifiedDateTimeUtc
            ).toLocaleString(DateTime.DATETIME_MED)}
          </div>
        </div>
        <div className="py-4 pr-2 w-40">
          <FormSubmissionControls
            viewForm={viewFormHandler}
            editForm={editFormHandler}
            formSubmission={formSubmission}
            submitForm={submitFormHandler}
            retractForm={retractFormHandler}
            deleteForm={deleteFormHandler}
          />
        </div>
      </div>
      <ListItemFooter formSubmission={formSubmission} />
    </div>
  );
};

export default FormSubmissionListItem;

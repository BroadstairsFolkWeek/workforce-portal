import { useSelector } from "react-redux";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { Form } from "../interfaces/form";
import { ContrastDark } from "survey-core/themes";

import { useFormSubmissionHandlers } from "../routes/FormSubmissionHandlers";
import { useCallback, useMemo } from "react";
import SpinnerOverlay from "./SpinnerOverlay";
import { selectFormsSavingStatus } from "../features/forms/forms-slice";

import "survey-core/defaultV2.min.css";

interface FormSubmissionEditProps {
  formSubmission: Form;
}

const FormSubmissionEdit: React.FC<FormSubmissionEditProps> = ({
  formSubmission,
}) => {
  const { saveForm } = useFormSubmissionHandlers();

  const formsSavingStatus = useSelector(selectFormsSavingStatus);

  const spinnerOverlay = useMemo(
    () =>
      formsSavingStatus === "saving" ? (
        <SpinnerOverlay verticalPosition="top" />
      ) : null,
    [formsSavingStatus]
  );

  const saveFormHandler = useCallback(
    async (answers: unknown) => {
      saveForm(formSubmission, answers);
    },
    [saveForm, formSubmission]
  );

  const survey = new Model(formSubmission.template.questions);
  survey.data = formSubmission.answers;
  survey.applyTheme(ContrastDark);
  survey.validate();

  survey.onComplete.add((sender) => saveFormHandler(sender.data));

  survey.validationAllowComplete = true;

  if (!survey) {
    console.log("No survey model");
    return null;
  }

  return (
    <div className="relative">
      <Survey model={survey} />
      {spinnerOverlay}
    </div>
  );
};

export default FormSubmissionEdit;

import { useSelector } from "react-redux";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { FormSubmission } from "../interfaces/form";
import { ContrastDark } from "survey-core/themes";

import { useFormSubmissionHandlers } from "../routes/FormSubmissionHandlers";
import { useCallback, useMemo } from "react";
import SpinnerOverlay from "./SpinnerOverlay";
import { selectFormsSavingStatus } from "../features/forms/forms-slice";

import "survey-core/defaultV2.min.css";

interface FormSubmissionEditProps {
  formSubmission: FormSubmission;
}

const FormSubmissionEdit: React.FC<FormSubmissionEditProps> = ({
  formSubmission,
}) => {
  const { saveForm, navigateHome } = useFormSubmissionHandlers();

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
      await saveForm(formSubmission, answers);
      navigateHome();
    },
    [saveForm, navigateHome, formSubmission]
  );

  const survey = new Model(formSubmission.formSpec.questions);
  survey.data = formSubmission.answers;
  survey.applyTheme(ContrastDark);

  survey.onComplete.add((sender) => saveFormHandler(sender.data));

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

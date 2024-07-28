import { useSelector } from "react-redux";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { Template } from "../interfaces/form";
import { ContrastDark } from "survey-core/themes";

import { useFormSubmissionHandlers } from "../routes/FormSubmissionHandlers";
import { useCallback, useMemo } from "react";
import SpinnerOverlay from "./SpinnerOverlay";
import { selectFormsSavingStatus } from "../features/forms/forms-slice";

import "survey-core/defaultV2.min.css";

interface CreatableFormNewProps {
  creatableForm: Template;
}

const CreatableFormNew: React.FC<CreatableFormNewProps> = ({
  creatableForm,
}) => {
  const { createNewForm, cancelNewForm } = useFormSubmissionHandlers();

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
      createNewForm(creatableForm, answers);
    },
    [createNewForm, creatableForm]
  );

  const survey = new Model(creatableForm.questions);
  survey.applyTheme(ContrastDark);

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

export default CreatableFormNew;

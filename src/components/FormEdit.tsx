import { useSelector } from "react-redux";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { Form } from "../interfaces/form";
import { ContrastDark } from "survey-core/themes";

import { useFormHandlers } from "../routes/FormHandlers";
import { useCallback, useMemo } from "react";
import SpinnerOverlay from "./SpinnerOverlay";
import { selectFormsSavingStatus } from "../features/forms/forms-slice";

import "survey-core/defaultV2.min.css";

interface FormEditProps {
  form: Form;
}

const FormEdit: React.FC<FormEditProps> = ({ form }) => {
  const { saveForm } = useFormHandlers();

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
      saveForm(form, answers);
    },
    [saveForm, form]
  );

  const survey = new Model(form.template.questions);
  survey.data = form.answers;
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

export default FormEdit;

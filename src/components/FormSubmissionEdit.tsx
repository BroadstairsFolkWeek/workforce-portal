import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { FormSubmission } from "../interfaces/form";
import { ContrastDark } from "survey-core/themes";

import "survey-core/defaultV2.min.css";
import { useDispatch } from "react-redux";
import { saveExistingFormSubmission } from "../features/forms/forms-slice";
import { AppDispatch } from "../store";

interface FormSubmissionEditProps {
  formSubmission: FormSubmission;
}

const FormSubmissionEdit: React.FC<FormSubmissionEditProps> = ({
  formSubmission,
}) => {
  const dispatch: AppDispatch = useDispatch();

  const survey = new Model(formSubmission.formSpec.questions);
  survey.data = formSubmission.answers;
  survey.applyTheme(ContrastDark);

  survey.onComplete.add((sender) => {
    dispatch(
      saveExistingFormSubmission({
        formSubmissionId: formSubmission.id,
        answers: sender.data,
      })
    );
  });

  window["survey"] = survey;

  if (!survey) {
    console.log("No survey model");
    return null;
  }

  return (
    <div>
      <Survey model={survey} />
    </div>
  );
};

export default FormSubmissionEdit;

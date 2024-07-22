import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { FormSubmission } from "../interfaces/form";
import { ContrastDark } from "survey-core/themes";

import "survey-core/defaultV2.min.css";
import { useFormSubmissionHandlers } from "../routes/FormSubmissionHandlers";
import { useCallback } from "react";

interface FormSubmissionEditProps {
  formSubmission: FormSubmission;
}

const FormSubmissionEdit: React.FC<FormSubmissionEditProps> = ({
  formSubmission,
}) => {
  const { saveForm, navigateHome } = useFormSubmissionHandlers();

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
    <div>
      <Survey model={survey} />
    </div>
  );
};

export default FormSubmissionEdit;

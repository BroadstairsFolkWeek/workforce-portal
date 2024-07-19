import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { FormSubmission } from "../interfaces/form";
import { ContrastDark } from "survey-core/themes";

import "survey-core/defaultV2.min.css";

interface FormSubmissionEditProps {
  formSubmission: FormSubmission;
  onSave: (answers: unknown) => void;
}

const FormSubmissionEdit: React.FC<FormSubmissionEditProps> = ({
  formSubmission,
  onSave,
}) => {
  const survey = new Model(formSubmission.formSpec.questions);
  survey.data = formSubmission.answers;
  survey.applyTheme(ContrastDark);

  survey.onComplete.add((sender) => onSave(sender.data));

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

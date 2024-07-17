import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { FormSubmission } from "../interfaces/form";
import { ContrastDark } from "survey-core/themes";

import "survey-core/defaultV2.min.css";

interface FormSubmissionEditProps {
  formSubmission: FormSubmission;
}

const FormSubmissionEdit: React.FC<FormSubmissionEditProps> = ({
  formSubmission,
}) => {
  const survey = new Model(formSubmission.formSpec.questions);
  survey.data = formSubmission.answers;
  survey.applyTheme(ContrastDark);
  window["survey"] = survey;

  return (
    <div>
      <Survey model={survey} />
    </div>
  );
};

export default FormSubmissionEdit;

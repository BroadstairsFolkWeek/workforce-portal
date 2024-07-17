import { FormSubmission } from "../interfaces/form";
import FormSubmissionEdit from "./FormSubmissionEdit";
import FormSubmissionListItem from "./FormSubmissionsListItem";

interface FormSubmissionListProps {
  formSubmissions: readonly FormSubmission[];
}

const FormSubmissionList: React.FC<FormSubmissionListProps> = ({
  formSubmissions,
}) => {
  return (
    <div>
      <h1>Form Submissions</h1>
      <p>Count {formSubmissions.length}</p>
      <div>
        {formSubmissions.map((formSubmission) => (
          <FormSubmissionListItem
            key={formSubmission.id}
            formSubmission={formSubmission}
          />
        ))}
      </div>
      <div>
        {formSubmissions.map((formSubmissions) => (
          <FormSubmissionEdit
            key={formSubmissions.id}
            formSubmission={formSubmissions}
          />
        ))}
      </div>
    </div>
  );
};

export default FormSubmissionList;

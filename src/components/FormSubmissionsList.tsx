import { FormSubmission } from "../interfaces/form";
import FormSubmissionListItem from "./FormSubmissionsListItem";

interface FormSubmissionListProps {
  formSubmissions: readonly FormSubmission[];
}

const FormSubmissionList: React.FC<FormSubmissionListProps> = ({
  formSubmissions,
}) => {
  return (
    <div>
      <div>
        {formSubmissions.map((formSubmission) => (
          <FormSubmissionListItem
            key={formSubmission.id}
            formSubmission={formSubmission}
          />
        ))}
      </div>
    </div>
  );
};

export default FormSubmissionList;

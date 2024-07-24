import { useSelector } from "react-redux";
import { FormSubmission } from "../interfaces/form";
import FormSubmissionListItem from "./FormSubmissionsListItem";
import SpinnerOverlay from "./SpinnerOverlay";
import { selectFormsSavingStatus } from "../features/forms/forms-slice";
import { useMemo } from "react";
import { Profile } from "../interfaces/profile";

interface FormSubmissionListProps {
  formSubmissions: readonly FormSubmission[];
  profile: Profile;
}

const FormSubmissionList: React.FC<FormSubmissionListProps> = ({
  formSubmissions,
  profile,
}) => {
  const formsSavingStatus = useSelector(selectFormsSavingStatus);

  const spinnerOverlay = useMemo(
    () => (formsSavingStatus === "saving" ? <SpinnerOverlay /> : null),
    [formsSavingStatus]
  );

  return (
    <div className="relative">
      <div>
        {formSubmissions.map((formSubmission) => (
          <FormSubmissionListItem
            key={formSubmission.id}
            formSubmission={formSubmission}
            profile={profile}
          />
        ))}
      </div>

      {spinnerOverlay}
    </div>
  );
};

export default FormSubmissionList;

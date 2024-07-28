import { useSelector } from "react-redux";
import FormSubmissionList from "../components/FormSubmissionsList";
import { selectFormSubmissions } from "../features/forms/forms-slice";
import { selectProfile } from "../features/profile/profile-slice";

const FormSubmissionsRoute = () => {
  const formSubmissions = useSelector(selectFormSubmissions);
  const profile = useSelector(selectProfile);

  return (
    <FormSubmissionList formSubmissions={formSubmissions} profile={profile!} />
  );
};

export default FormSubmissionsRoute;

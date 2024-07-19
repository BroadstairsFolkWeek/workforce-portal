import { useSelector } from "react-redux";
import FormSubmissionList from "../components/FormSubmissionsList";
import { selectFormSubmissions } from "../features/forms/forms-slice";

const FormSubmissionsRoute = () => {
  const formSubmissions = useSelector(selectFormSubmissions);

  return <FormSubmissionList formSubmissions={formSubmissions} />;
};

export default FormSubmissionsRoute;

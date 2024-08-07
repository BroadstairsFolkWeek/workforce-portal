import { useSelector } from "react-redux";
import FormsList from "../components/FormsList";
import { selectForms } from "../features/forms/forms-slice";
import { selectProfile } from "../features/profile/profile-slice";

const FormRoute = () => {
  const forms = useSelector(selectForms);
  const profile = useSelector(selectProfile);

  return <FormsList forms={forms} profile={profile!} />;
};

export default FormRoute;

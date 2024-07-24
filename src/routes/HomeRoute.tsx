import { useSelector } from "react-redux";
import { selectProfile } from "../features/profile/profile-slice";
import HomeWithProfile from "../components/HomeWithProfile";
import HomeWithoutProfile from "../components/HomeWithoutProfile";
import {
  selectCreatableForms,
  selectFormSubmissions,
} from "../features/forms/forms-slice";

const HomeRoute = () => {
  const profile = useSelector(selectProfile);
  const forms = useSelector(selectFormSubmissions);
  const creatableForms = useSelector(selectCreatableForms);

  if (profile) {
    return (
      <HomeWithProfile
        profile={profile}
        formSubmissions={forms}
        creatableForms={creatableForms}
      />
    );
  } else {
    return <HomeWithoutProfile />;
  }
};

export default HomeRoute;

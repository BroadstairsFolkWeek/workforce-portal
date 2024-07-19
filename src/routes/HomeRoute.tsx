import { useSelector } from "react-redux";
import { selectProfile } from "../features/profile/profile-slice";
import HomeWithProfile from "../components/HomeWithProfile";
import HomeWithoutProfile from "../components/HomeWithoutProfile";

const HomeRoute = () => {
  const profile = useSelector(selectProfile);

  if (profile) {
    return <HomeWithProfile profile={profile} />;
  } else {
    return <HomeWithoutProfile />;
  }
};

export default HomeRoute;

import { useSelector } from "react-redux";
import { selectProfile } from "../features/profile/profile-slice";
import ProfileForm from "../components/forms/ProfileForm";

export const Component = () => {
  const profile = useSelector(selectProfile);

  if (profile) {
    return <ProfileForm profile={profile} />;
  } else {
    return null;
  }
};

Component.displayName = "ProfileEditRoute";

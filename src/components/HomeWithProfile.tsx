import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import FormSubmissionList from "./FormSubmissionsList";
import { selectFormSubmissions } from "../features/forms/forms-slice";
import { Profile } from "../interfaces/profile";

export interface HomeWithProfileProps {
  profile: Profile;
}

const HomeWithProfile: React.FC<HomeWithProfileProps> = ({ profile }) => {
  const formSubmissions = useSelector(selectFormSubmissions);

  const profileReminder = useMemo(() => {
    if (profile.meta.photoRequired) {
      return (
        <div className="m-4 p-4 bg-red-200 outline outline-4 outline-yellow-100 rounded-lg">
          Please{" "}
          <Link to="/profilePhoto" className="underline">
            upload a profile photo
          </Link>{" "}
          as it forms part of your workforce application and will be used on
          your ID badge.
        </div>
      );
    } else if (profile.meta.profileInformationRequired) {
      return (
        <div className="m-4 p-4 bg-red-200 outline outline-4 outline-yellow-100 rounded-lg">
          Please{" "}
          <Link to="/profile" className="underline">
            fill in your profile
          </Link>{" "}
          as it forms part of your workforce application.
        </div>
      );
    } else {
      return null;
    }
  }, [profile]);

  return (
    <div>
      {profileReminder}
      <div className="space-y-2 text-left">
        <h1 className="text-xl">Your forms</h1>
        <FormSubmissionList formSubmissions={formSubmissions} />
      </div>
    </div>
  );
};

export default HomeWithProfile;

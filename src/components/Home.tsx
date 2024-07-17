import { useMemo } from "react";
import { Link } from "react-router-dom";
import ApplicationDisplayPanel from "./ApplicationDisplayPanel";
import HomeLayout from "./HomeLayout";
import { useSelector } from "react-redux";
import {
  selectProfile,
  selectProfileLoadingStatus,
} from "../features/profile/profile-slice";
import FormSubmissionList from "./FormSubmissionsList";
import { selectFormSubmissions } from "../features/forms/forms-slice";

export interface WelcomeProps {}

const Home: React.FC<WelcomeProps> = () => {
  const profile = useSelector(selectProfile);
  const profileLoadingStatus = useSelector(selectProfileLoadingStatus);
  const formSubmissions = useSelector(selectFormSubmissions);

  const profileReminder = useMemo(() => {
    if (profileLoadingStatus === "loaded" && profile) {
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
    } else {
      return null;
    }
  }, [profileLoadingStatus, profile]);

  if (profile) {
    return (
      <HomeLayout>
        {profileReminder}
        <div className="space-y-2 text-left">
          <h1 className="text-xl">Your application</h1>
          <ApplicationDisplayPanel />
        </div>

        <div className="space-y-2 text-left">
          <h1 className="text-xl">Your forms</h1>
          <FormSubmissionList formSubmissions={formSubmissions} />
        </div>
      </HomeLayout>
    );
  } else {
    return (
      <HomeLayout>
        <div className="space-y-2 text-left">
          <h1 className="text-2xl text-center">
            Welcome to the Broadstairs Folk Week Workforce Portal
          </h1>
          <p>
            Please use this website to manage your membership of the Broadstairs
            Folk Week volunteer workforce.
          </p>
        </div>

        <div className="mt-8">
          <p className="text-xl text-center">
            <a className="m-1 p-1 underline" href="/.auth/login/bcauth">
              Sign Up or Sign In to get started.
            </a>
          </p>
        </div>
      </HomeLayout>
    );
  }
};

export default Home;

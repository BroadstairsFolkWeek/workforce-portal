import { useMemo } from "react";
import { Link } from "react-router-dom";
import ApplicationDisplayPanel from "./ApplicationDisplayPanel";
import { useUserProfile } from "./contexts/UserProfileContext";
import { useUserProfilePhotos } from "./contexts/UserProfilePhotosContext";
import HomeLayout from "./HomeLayout";

export interface WelcomeProps {}

const Home: React.FC<WelcomeProps> = () => {
  const { userProfile, profileComplete } = useUserProfile();
  const { loaded: photoContextLoaded, photoUploaded } = useUserProfilePhotos();

  const profileReminder = useMemo(() => {
    if (profileComplete) {
      if (photoContextLoaded && photoUploaded) {
        return null;
      } else {
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
      }
    } else {
      return (
        <div className="m-4 p-4 bg-red-200 outline outline-4 outline-yellow-100 rounded-lg">
          Please{" "}
          <Link to="/profile" className="underline">
            fill in your profile
          </Link>{" "}
          as it forms part of your workforce application.
        </div>
      );
    }
  }, [profileComplete, photoContextLoaded, photoUploaded]);

  if (userProfile) {
    return (
      <HomeLayout>
        {profileReminder}
        <div className="space-y-2 text-left">
          <h1 className="text-xl">Your application</h1>
          <ApplicationDisplayPanel />
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
            <a className="m-1 p-1 underline" href="/.auth/login/b2cauth">
              Sign Up or Sign In to get started.
            </a>
          </p>
        </div>
      </HomeLayout>
    );
  }
};

export default Home;

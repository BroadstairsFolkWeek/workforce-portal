// import { useCallback } from "react";
import ApplicationDisplayPanel from "./ApplicationDisplayPanel";
// import { useNavigate } from "react-router-dom";
import { useUserProfile } from "./contexts/UserProfileContext";
import HomeLayout from "./HomeLayout";

export interface WelcomeProps {}

const Home: React.FC<WelcomeProps> = () => {
  const { userProfile } = useUserProfile();
  // const navigate = useNavigate();

  // const newApplicationHandler = useCallback(() => {}, []);

  if (userProfile) {
    return (
      <HomeLayout>
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

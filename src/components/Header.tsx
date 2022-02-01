import { useUserProfile } from "./contexts/UserProfileContext";

const Header: React.FC = () => {
  const { loaded, userProfile } = useUserProfile();

  let authPanel = null;

  if (loaded) {
    if (userProfile) {
      authPanel = (
        <a className="m-1 p-1 text-bfw-link" href="/.auth/logout">
          Sign Out {userProfile.userDetails}
        </a>
      );
    } else {
      authPanel = (
        <a className="m-1 p-1 text-bfw-link" href="/.auth/login/b2cauth">
          Sign In or Create Account
        </a>
      );
    }
  } else {
    authPanel = (
      <p className="text-bfw-link animate-pulse">Checking authentication...</p>
    );
  }

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-2 bg-bfw-yellow">
      <div className="sm:col-span-2 p-1 bg-black text-right">
        <div>{authPanel}</div>
      </div>
      <div className="mx-4 my-1 h-32 bg-header-logo bg-contain bg-no-repeat bg-center"></div>
      <div className="flex-grow p-1">
        <h1 className="text-4xl font-black">Workforce Portal</h1>
      </div>
    </div>
  );
};

export default Header;

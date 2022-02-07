import { useUserProfile } from "./contexts/UserProfileContext";

const Header: React.FC = () => {
  const { loaded, userProfile } = useUserProfile();

  let authPanel = null;

  if (loaded) {
    if (userProfile) {
      authPanel = (
        <a className="m-1 p-1 text-bfw-link" href="/api/logout">
          Sign Out {userProfile.displayName}
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
      <div className="mx-4 my-1 sm:my-4 h-32 bg-header-logo bg-contain bg-no-repeat bg-center"></div>
      <div className="flex flex-grow flex-col justify-around my-1 p-1">
        <h1 className="text-4xl sm:text-6xl font-black text-center">
          Workforce Portal
        </h1>
      </div>
    </div>
  );
};

export default Header;

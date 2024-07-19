import { Link, Outlet } from "react-router-dom";
import Spinner from "./Spinner";
import { useSelector } from "react-redux";
import { selectProfileLoadingStatus } from "../features/profile/profile-slice";
import Header from "./Header";
import Footer from "./Footer";

const Layout: React.FC = () => {
  const profileStatus = useSelector(selectProfileLoadingStatus);

  if (profileStatus === "loading") {
    return (
      <div className="flex flex-col h-screen bg-bfw-yellow">
        <div className="flex-grow" />
        <Spinner />
        <div className="flex-grow" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col gap-1">
      <div>
        <Header />
      </div>
      <Link to="/" className="block ml-2 text-left">
        &lt; Home
      </Link>
      <div className="flex-grow m-auto px-2 w-full max-w-lg">
        <Outlet />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;

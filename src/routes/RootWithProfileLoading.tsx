import { Link, Outlet } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useSelector } from "react-redux";
import {
  selectProfileLoadingStatus,
  selectProfileSavingStatus,
} from "../features/profile/profile-slice";
import Header from "../components/Header";
import Footer from "../components/Footer";

const RootWithProfileLoading: React.FC = () => {
  const profileLoadingStatus = useSelector(selectProfileLoadingStatus);
  const profileSavingStatus = useSelector(selectProfileSavingStatus);

  if (profileLoadingStatus === "loading" || profileSavingStatus === "saving") {
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

export default RootWithProfileLoading;

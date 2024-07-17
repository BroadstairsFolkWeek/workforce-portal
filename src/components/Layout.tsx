import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import ApplicationForm from "./forms/ApplicationForm";
import ProfileForm from "./forms/ProfileForm";
import Home from "./Home";
import PhotoPage from "./PhotoPage";
import PrivacyPolicy from "./PrivacyPolicy";
import Spinner from "./Spinner";
import TermsAndConditions from "./TermsAndConditions";
import { useSelector } from "react-redux";
import { selectProfileLoadingStatus } from "../features/profile/profile-slice";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

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
    <>
      <ScrollToTop />
      <Routes>
        <Route path="*" element={<Home />} />
        <Route path="/application" element={<ApplicationForm />} />
        <Route path="/profile" element={<ProfileForm />} />
        <Route path="/profilePhoto" element={<PhotoPage />} />
        <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
      </Routes>
    </>
  );
};

export default Layout;

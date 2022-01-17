import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Spinner from "./Spinner";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-bfw-yellow">
      <ScrollToTop />
      <div className="flex-grow" />
      <Spinner />
      <div className="flex-grow" />
    </div>
  );
};

export default Layout;

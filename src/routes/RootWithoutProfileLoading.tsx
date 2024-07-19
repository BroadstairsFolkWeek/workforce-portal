import { Link, Outlet } from "react-router-dom";
import HeaderWithoutProfile from "../components/HeaderWithoutProfile";
import Footer from "../components/Footer";

const RootWithoutProfileLoading: React.FC = () => {
  return (
    <div className="h-screen flex flex-col gap-1">
      <div>
        <HeaderWithoutProfile />
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

export default RootWithoutProfileLoading;

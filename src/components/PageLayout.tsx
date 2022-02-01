import { Link } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const PageLayout: React.FC = ({ children }) => {
  return (
    <div className="h-screen flex flex-col gap-1">
      <div>
        <Header />
      </div>
      <Link to="/" className="block ml-2 text-left">
        &lt; Home
      </Link>
      <div className="flex-grow m-auto px-2 w-full max-w-lg">{children}</div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default PageLayout;

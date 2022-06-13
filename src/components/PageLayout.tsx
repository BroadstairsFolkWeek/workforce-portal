import { Link } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

export interface PageLayoutProps {
  preFooterRender?: () => JSX.Element;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  preFooterRender,
}) => {
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
        {preFooterRender ? preFooterRender() : null}
        <Footer />
      </div>
    </div>
  );
};

export default PageLayout;

import Footer from "./Footer";
import Header from "./Header";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col gap-1">
      <div>
        <Header />
      </div>
      <div className="flex-grow m-auto px-2 w-full max-w-lg">{children}</div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default HomeLayout;

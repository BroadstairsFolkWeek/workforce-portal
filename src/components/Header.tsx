import ProfileControl from "./ProfileControl";

const Header: React.FC = () => {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-2 bg-bfw-yellow">
      <div className="sm:col-span-2 p-1 bg-black text-right">
        <ProfileControl />
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

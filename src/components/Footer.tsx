import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectProfile } from "../features/profile/profile-slice";

const Footer: React.FC = () => {
  const profile = useSelector(selectProfile);

  return (
    <>
      {profile ? null : (
        <div className="px-2 h-8 text-right">
          <span className="inline-block mr-2 h-full align-middle underline">
            <a href="/api/logout">
              Trouble logging in? Click to clear login data.
            </a>
          </span>
        </div>
      )}
      <div className="px-2 h-12 flex flex-row justify-between items-center bg-black text-white text-left">
        <div className="h-10 flex flex-row items-center gap-2">
          <a
            href="https://watfordconsulting.com"
            target="_blank"
            rel="noreferrer"
          >
            Built by
          </a>
          <a
            href="https://watfordconsulting.com"
            target="_blank"
            rel="noreferrer"
            className="h-full w-32 bg-watford-consulting-logo-white bg-contain bg-no-repeat bg-left"
          >
            {""}
          </a>
        </div>
        <Link to="/privacyPolicy" className="inline ">
          <span className="align-bottom">Privacy Policy</span>
        </Link>
      </div>
    </>
  );
};

export default Footer;

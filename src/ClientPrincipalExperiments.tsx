import { useClientPrincipal } from "@aaronpowell/react-static-web-apps-auth";
import { useUserProfile } from "./services/UserProfileContext";

const ClientPrincipalExperiements: React.FC = () => {
  const { clientPrincipal, loaded } = useClientPrincipal();
  const { loaded: userProfileLoaded, userProfile } = useUserProfile();

  return (
    <div className="p-4 text-left">
      <div>Loaded: {loaded}</div>
      <div>
        Client Principal: <pre>{JSON.stringify(clientPrincipal, null, 2)}</pre>
      </div>
      <div>User Profile Loaded: {userProfileLoaded}</div>
      <div>
        User Profile: <pre>{JSON.stringify(userProfile, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ClientPrincipalExperiements;

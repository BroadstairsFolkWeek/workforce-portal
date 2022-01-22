import { useClientPrincipal } from "@aaronpowell/react-static-web-apps-auth";

const ClientPrincipalExperiements: React.FC = () => {
  const { clientPrincipal, loaded } = useClientPrincipal();

  return (
    <div>
      <div>Loaded: {loaded}</div>
      <div>Client Principal: {JSON.stringify(clientPrincipal, null, 2)}</div>
    </div>
  );
};

export default ClientPrincipalExperiements;

import React, { createContext, useContext, useEffect, useState } from "react";
import { useClientPrincipal } from "@aaronpowell/react-static-web-apps-auth";

import { Claim } from "../../../api/interfaces/claim";

/**
 * Extracts claims from the client principal and makes them avaialble to the application.
 */

export type IClientSidePrincipalClaimsContext = {
  loaded: boolean;
  authenticated: boolean;
  claims: Claim[];
};

const ClientPrincipalClaimsContext =
  createContext<IClientSidePrincipalClaimsContext>({
    loaded: false,
    authenticated: false,
    claims: [],
  });

const ClientPrincipalClaimsContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const { clientPrincipal, loaded } = useClientPrincipal();
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    if (clientPrincipal) {
      setAuthenticated(true);
      setClaims((clientPrincipal as any).claims as Claim[]);
      // const c: Claim[] = [{ typ: "emails", value: "foo@example.com" }];
      // setClaims(c);
    } else {
      setAuthenticated(false);
    }
  }, [clientPrincipal, loaded]);

  return (
    <ClientPrincipalClaimsContext.Provider
      value={{ loaded, authenticated, claims }}
    >
      {children}
    </ClientPrincipalClaimsContext.Provider>
  );
};

const useClientPrincipalClaims = () => useContext(ClientPrincipalClaimsContext);

export { ClientPrincipalClaimsContextProvider, useClientPrincipalClaims };

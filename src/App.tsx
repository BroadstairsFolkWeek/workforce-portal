import React from "react";
import { ClientPrincipalContextProvider } from "@aaronpowell/react-static-web-apps-auth";
import { BrowserRouter } from "react-router-dom";

import "./App.css";
import ClientPrincipalExperiements from "./ClientPrincipalExperiments";
import { UserProfileContextProvider } from "./components/contexts/UserProfileContext";
import { ClientPrincipalClaimsContextProvider } from "./components/contexts/ClientPrincipalClaimsContext";

function App() {
  return (
    <ClientPrincipalContextProvider>
      <ClientPrincipalClaimsContextProvider>
        <BrowserRouter>
          <UserProfileContextProvider>
            <div className="App">
              <ClientPrincipalExperiements />
              {/* <Layout /> */}
            </div>
          </UserProfileContextProvider>
        </BrowserRouter>
      </ClientPrincipalClaimsContextProvider>
    </ClientPrincipalContextProvider>
  );
}

export default App;

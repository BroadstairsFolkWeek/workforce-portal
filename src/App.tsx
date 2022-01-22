import React from "react";
import { ClientPrincipalContextProvider } from "@aaronpowell/react-static-web-apps-auth";
import { BrowserRouter } from "react-router-dom";

import "./App.css";
import ClientPrincipalExperiements from "./ClientPrincipalExperiments";
import { UserProfileContextProvider } from "./services/UserProfileContext";

function App() {
  return (
    <ClientPrincipalContextProvider>
      <BrowserRouter>
        <div className="App">
          <UserProfileContextProvider>
            <ClientPrincipalExperiements />
            {/* <Layout /> */}
          </UserProfileContextProvider>
        </div>
      </BrowserRouter>
    </ClientPrincipalContextProvider>
  );
}

export default App;

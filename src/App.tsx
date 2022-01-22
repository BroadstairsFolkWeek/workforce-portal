import React from "react";
import { ClientPrincipalContextProvider } from "@aaronpowell/react-static-web-apps-auth";
import { BrowserRouter } from "react-router-dom";

import "./App.css";
import ClientPrincipalExperiements from "./ClientPrincipalExperiments";

function App() {
  return (
    <ClientPrincipalContextProvider>
      <BrowserRouter>
        <div className="App">
          <ClientPrincipalExperiements />
          {/* <UserProfileContextProvider> */}
          {/* <Layout /> */}
          {/* </UserProfileContextProvider> */}
        </div>
      </BrowserRouter>
    </ClientPrincipalContextProvider>
  );
}

export default App;

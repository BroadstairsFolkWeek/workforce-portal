import React from "react";
import { ClientPrincipalContextProvider } from "@aaronpowell/react-static-web-apps-auth";
import { BrowserRouter } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";

import { UserProfileContextProvider } from "./components/contexts/UserProfileContext";
import Layout from "./components/Layout";
import { ApplicationContextProvider } from "./components/contexts/ApplicationContext";
import { EditApplicationContextProvider } from "./components/contexts/EditApplicationContext";

initializeIcons();

function App() {
  return (
    <ClientPrincipalContextProvider>
      <UserProfileContextProvider>
        <ApplicationContextProvider>
          <EditApplicationContextProvider>
            <BrowserRouter>
              {/* <div className="App"> */}
              <Layout />
              {/* </div> */}
            </BrowserRouter>
          </EditApplicationContextProvider>
        </ApplicationContextProvider>
      </UserProfileContextProvider>
    </ClientPrincipalContextProvider>
  );
}

export default App;

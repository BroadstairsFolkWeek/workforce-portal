import React from "react";
import { BrowserRouter } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";

import { UserProfileContextProvider } from "./components/contexts/UserProfileContext";
import Layout from "./components/Layout";
import { ApplicationContextProvider } from "./components/contexts/ApplicationContext";
import { EditApplicationContextProvider } from "./components/contexts/EditApplicationContext";
import { UserProfilePhotosContextProvider } from "./components/contexts/UserProfilePhotosContext";
import { TeamsContextProvider } from "./components/contexts/TeamsContext";

initializeIcons();

function App() {
  return (
    <TeamsContextProvider>
      <UserProfileContextProvider>
        <UserProfilePhotosContextProvider>
          <ApplicationContextProvider>
            <EditApplicationContextProvider>
              <BrowserRouter>
                <Layout />
              </BrowserRouter>
            </EditApplicationContextProvider>
          </ApplicationContextProvider>
        </UserProfilePhotosContextProvider>
      </UserProfileContextProvider>
    </TeamsContextProvider>
  );
}

export default App;

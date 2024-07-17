import { BrowserRouter } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import { Provider } from "react-redux";

import Layout from "./components/Layout";
import { ApplicationContextProvider } from "./components/contexts/ApplicationContext";
import { EditApplicationContextProvider } from "./components/contexts/EditApplicationContext";
import { TeamsContextProvider } from "./components/contexts/TeamsContext";
import store from "./store";
import { fetchProfile } from "./features/profile/profile-slice";

initializeIcons();

store.dispatch(fetchProfile());

function App() {
  return (
    <Provider store={store}>
      <TeamsContextProvider>
        <ApplicationContextProvider>
          <EditApplicationContextProvider>
            <BrowserRouter>
              <Layout />
            </BrowserRouter>
          </EditApplicationContextProvider>
        </ApplicationContextProvider>
      </TeamsContextProvider>
    </Provider>
  );
}

export default App;

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import { Provider } from "react-redux";

import Layout from "./components/Layout";
import { ApplicationContextProvider } from "./components/contexts/ApplicationContext";
import { EditApplicationContextProvider } from "./components/contexts/EditApplicationContext";
import { TeamsContextProvider } from "./components/contexts/TeamsContext";
import store from "./store";
import { fetchProfile } from "./features/profile/profile-slice";
import Home from "./components/Home";
import ApplicationForm from "./components/forms/ApplicationForm";
import ProfileForm from "./components/forms/ProfileForm";
import PhotoPage from "./components/PhotoPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsAndConditions from "./components/TermsAndConditions";

initializeIcons();

store.dispatch(fetchProfile());

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/application", element: <ApplicationForm /> },
      { path: "/profile", element: <ProfileForm /> },
      { path: "/profilePhoto", element: <PhotoPage /> },
      { path: "/privacyPolicy", element: <PrivacyPolicy /> },
    ],
  },
  { path: "/terms", element: <TermsAndConditions /> },
]);

function App() {
  return (
    <Provider store={store}>
      <TeamsContextProvider>
        <ApplicationContextProvider>
          <EditApplicationContextProvider>
            <RouterProvider router={router} />
          </EditApplicationContextProvider>
        </ApplicationContextProvider>
      </TeamsContextProvider>
    </Provider>
  );
}

export default App;

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import { Provider } from "react-redux";

import RootWithProfileLoading from "./routes/RootWithProfileLoading";
import store from "./store";
import { fetchProfile } from "./features/profile/profile-slice";
import ProfileForm from "./components/forms/ProfileForm";
import PhotoPage from "./components/PhotoPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsAndConditions from "./components/TermsAndConditions";
import RootWithoutProfileLoading from "./routes/RootWithoutProfileLoading";
import ErrorPage from "./components/ErrorPage";
import FormSubmissionsRoute from "./routes/FormSubmissionsRoute";
import CreatableFormsRoute from "./routes/CreateableFormsRoute";
import HomeRoute from "./routes/HomeRoute";

initializeIcons();

store.dispatch(fetchProfile());

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootWithProfileLoading />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomeRoute /> },
      {
        path: "formSubmissions",
        children: [
          { index: true, element: <FormSubmissionsRoute /> },
          {
            path: ":formSubmissionId",

            children: [
              {
                index: true,
                lazy: () => import("./routes/FormSubmissionRoute"),
              },
              {
                path: "edit",
                lazy: () => import("./routes/FormSubmissionEditRoute"),
              },
            ],
          },
        ],
      },
      {
        path: "creatableForms",
        children: [
          { index: true, element: <CreatableFormsRoute /> },
          {
            path: ":creatableFormId",
            lazy: () => import("./routes/CreatableFormNewRoute"),
          },
        ],
      },
      { path: "profile", lazy: () => import("./routes/ProfileEditRoute") },
      { path: "profilePhoto", element: <PhotoPage /> },
    ],
  },
  {
    path: "/",
    element: <RootWithoutProfileLoading />,
    errorElement: <ErrorPage />,
    children: [
      { path: "privacyPolicy", element: <PrivacyPolicy /> },
      { path: "terms", element: <TermsAndConditions /> },
    ],
  },
]);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;

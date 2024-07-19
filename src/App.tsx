import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import { Provider } from "react-redux";

import RootWithProfileLoading from "./routes/RootWithProfileLoading";
import store from "./store";
import { fetchProfile } from "./features/profile/profile-slice";
import Home from "./components/Home";
import ProfileForm from "./components/forms/ProfileForm";
import PhotoPage from "./components/PhotoPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsAndConditions from "./components/TermsAndConditions";
import RootWithoutProfileLoading from "./routes/RootWithoutProfileLoading";
import ErrorPage from "./components/ErrorPage";
import FormSubmissionsRoute from "./routes/FormSubmissionsRoute";
import FormSubmissionRoute, {
  FormSubmissionRouteLoader,
} from "./routes/FormSubmissionRoute";
import FormSubmissionEditRoute, {
  FormSubmissionEditRouteLoader,
} from "./routes/FormSubmissionEditRoute";

initializeIcons();

store.dispatch(fetchProfile());

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootWithProfileLoading />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "formSubmissions",
        children: [
          { index: true, element: <FormSubmissionsRoute /> },
          {
            path: ":formSubmissionId",

            children: [
              {
                index: true,
                element: <FormSubmissionRoute />,
                loader: FormSubmissionRouteLoader,
              },
              {
                path: "edit",
                element: <FormSubmissionEditRoute />,
                loader: FormSubmissionEditRouteLoader,
              },
            ],
          },
        ],
      },
      { path: "profile", element: <ProfileForm /> },
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

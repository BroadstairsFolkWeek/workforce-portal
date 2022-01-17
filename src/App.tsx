import React from "react";
import { BrowserRouter } from "react-router-dom";

import "./App.css";
import Layout from "./components/Layout";
import { UserProfileContextProvider } from "./services/UserProfileContext";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <UserProfileContextProvider>
          <Layout />
        </UserProfileContextProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;

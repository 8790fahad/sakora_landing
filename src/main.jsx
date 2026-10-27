import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import VersionUpdate from "./components/VersionUpdate";
import { APP_UPDATE_RETURN_KEY } from "./version";

const startupUrl = new URL(window.location.href);
const returnTo = sessionStorage.getItem(APP_UPDATE_RETURN_KEY);
if (returnTo || startupUrl.pathname.includes("/__app_update_")) {
  sessionStorage.removeItem(APP_UPDATE_RETURN_KEY);
  window.history.replaceState(window.history.state, "", returnTo || "/");
} else if (startupUrl.searchParams.has("v")) {
  startupUrl.searchParams.delete("v");
  const next = `${startupUrl.pathname}${startupUrl.search}${startupUrl.hash}`;
  window.history.replaceState(window.history.state, "", next);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <VersionUpdate />
      <App />
      <Toaster position="top-center" />
    </BrowserRouter>
  </React.StrictMode>
);

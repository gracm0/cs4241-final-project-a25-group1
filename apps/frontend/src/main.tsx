// Entry point for the React app.
// - Imports React, ReactDOM, React Router, main App component, and global CSS.
// - Finds the root HTML element and mounts the React app there.
// - Wraps the app in React.StrictMode (for highlighting potential problems) and BrowserRouter (for client-side routing).

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

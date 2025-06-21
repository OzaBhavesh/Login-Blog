import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Compo/context/AuthContext"; // ✅ Import AuthProvider
import App from "./App"; // ✅ Import App

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider> {/* ✅ Fix: Ensure AuthProvider is the outermost wrapper */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);

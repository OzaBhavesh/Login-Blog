import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ Import Auth Context

const PrivateRoute = () => {
  const { user, token } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // ✅ Prevent Reload (F5, Ctrl+R)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === "r") || e.key === "F5" || (e.metaKey && e.key === "r")) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ✅ Store previous location in sessionStorage
  useEffect(() => { 
    sessionStorage.setItem("lastVisited", location.pathname);
  }, [location]);

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

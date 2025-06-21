import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "./Compo/context/AuthContext"; // ✅ Use AuthContext

// ✅ Import Pages
import Login from "./Compo/Authentication/Login";
import SignUp from "./Compo/Authentication/Signup";
import ForgotPassword from "./Compo/Authentication/ForgotPassword";
import Main from "./Compo/User/Pages/Main";
import CreateBlogForm from "./Compo/User/Pages/BlogsList";
import UserDashboard from "./Compo/User/Pages/dashboard";
import CategoryList from "./Compo/User/Pages/CategoryPage";
import AdminDashboard from "./Compo/Admin/AdminDashboard"; // ✅ Import Admin Panel

// ✅ Protected Route with Role-Based Navigation
function ProtectedRoute({ children }) {
  const { user, token } = useAuth(); // ✅ Get user and token

  if (!token) {
    return <Navigate to="/login" />; // Redirect to login if not authenticated
  }

  if (user?.isAdmin) {
    return <Navigate to="/admin" />; // ✅ Redirect admins to Admin Panel
  }

  return children; // ✅ Normal users continue to their page
}

// ✅ Separate Admin Protected Route
function AdminProtectedRoute({ children }) {
  const { user, token } = useAuth();

  if (!token || !user?.isAdmin) {
    return <Navigate to="/dashboard" />; // ✅ Redirect non-admins to User Dashboard
  }

  return children;
}

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={1000} />
      <Routes>
        {/* ✅ Default Route */}
        <Route path="*" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ✅ User Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/create-blog" element={<ProtectedRoute><CreateBlogForm /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoryList /></ProtectedRoute>} />

        {/* ✅ Admin Protected Route */}
        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;

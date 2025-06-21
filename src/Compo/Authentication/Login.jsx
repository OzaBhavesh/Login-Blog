import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Authentication/Style/Login.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../context/AuthContext"; // ✅ Import useAuth

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Get login function from AuthContext

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false); // ✅ Loading state

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    // ✅ Validation
    if (!email || !password) {
      toast.error("❌ All fields are required!", { position: "top-right", autoClose: 1500 });
      return;
    }

    setLoading(true); // ✅ Start Loading

    try {
      const response = await axios.post("http://localhost:5000/user/Signin", { email, password });

      // ✅ Store Token & User Info
      const { token, user } = response.data;

      if (!token || !user) {
        toast.error("Invalid credentials!", { position: "top-right", autoClose: 2000 });
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Set user in context
      login(token, user);

      toast.success("✅ Login Successful!", { position: "top-right", autoClose: 1500 });

      // ✅ Redirect to Dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);

      // ✅ Handle API Errors
      let errorMessage = "Login failed! Please try again.";
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server. Check your internet connection.";
      }

      toast.error(errorMessage, { position: "top-right", autoClose: 2000 });
    } finally {
      setLoading(false); // ✅ Stop Loading
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className={styles.authLinks}>
          <p>
            Don't have an account? <span onClick={() => navigate("/signup")} className={styles.link}>Sign Up</span>
          </p>
          <p>
            Forgot Password? <span onClick={() => navigate("/forgot-password")} className={styles.link}>Reset Here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Authentication/Style/ForgotPassword.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword) {
      toast.error("All fields are required!", { position: "top-right", autoClose: 1000 });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-right", autoClose: 1000 });
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/user/ForgotPassword", { email, password });
      
      if (response.data.success) {
        toast.success("✅ Password changed successfully!", { position: "top-right", autoClose: 1000 });
        navigate("/login");
      } else {
        toast.error("User is not valid!", { position: "top-right", autoClose: 1000 });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to reset password!";
      toast.error(errorMessage, { position: "top-right", autoClose: 1000 });
    }
  };

  return (
    <div className={styles.forgotContainer}>
      <div className={styles.forgotBox}>
        <h2>Reset Password</h2>
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
            placeholder="Enter new password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" className={styles.submitBtn}>Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Authentication/Style/Signup.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext"; // ✅ Import useAuth

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Fix: Destructure `login` from useAuth

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = formData;

    if (!name || !email || !password) {
      toast.error("❌ All fields are required!", { position: "top-right", autoClose: 2000 });
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/user/Signup", formData);
      
      // ✅ Show success message
      toast.success("✅ Registration Successful!", { position: "top-right", autoClose: 2000 });

      // ✅ Login user automatically after signup
      login(response.data.token, response.data.user);

      // ✅ Redirect to Dashboard
      navigate("/dashboard");

      // ✅ Reset Form Fields
      setFormData({ name: "", email: "", password: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "❌ Registration failed!", { position: "top-right", autoClose: 2000 });
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupBox}>
        <h2>Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required />
          <button type="submit" className={styles.submitBtn}>Sign Up</button>
        </form>

        {/* ✅ Working Login Navigation */}
        <p className={styles.redirectText}>
          Already have an account?  
          <span 
            onClick={() => navigate("/login")} 
            className={styles.link} 
            style={{ cursor: "pointer", textDecoration: "underline", color: "blue" }} 
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;

import React, { useState, useEffect } from "react"; 
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import style from "../Style/navbar.module.css"; 

const Navbar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null); 

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const { data } = await axios.get("http://localhost:5000/user/profile", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(data.user); 
        } catch (error) {
          console.error("Error fetching user:", error);
          setUser(null);
        }
      }
    };

    fetchUser();
  }, [token]); // ✅ Runs when token changes to update user data

  const handleLogin = () => {
    navigate("/login"); 
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/user/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      navigate("/");
      window.location.reload(); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className={style.navbar}>
      <div className={style.navbarLeft}>
        <a href="/" className={style.logo}></a> 
      </div>
      <div className={style.navbarCenter}>
        <ul className={style.navLinks}>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/blogs">Blogs</NavLink></li>
          
            <li><NavLink to="/dashboard">Dashboard</NavLink></li>
      
        </ul>
      </div>
      <div className={style.navbarRight}>
        {token ? (
          <button className={style.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className={style.loginBtn} onClick={handleLogin}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

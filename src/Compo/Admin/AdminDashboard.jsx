import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./Style/AdminDashboard.module.css";
import { useAuth } from "./../context/AuthContext";

const AdminDashboard = () => {
  const { user, token, logout } = useAuth() || {};
  const navigate = useNavigate();

  const [totalBlogs, setTotalBlogs] = useState(0);
  const [allBlogs, setAllBlogs] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user?.isAdmin) {
      navigate("/", { replace: true });
      return;
    }

    fetchDashboardData();
    fetchUserCount();
    fetchUsers();
  }, [token, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/blogs/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllBlogs(data);
      setTotalBlogs(data.length);
      setMyBlogs(data.filter((blog) => blog.userId === user._id));
    } catch (error) {
      toast.error("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCount = async () => {
    try {
      const res = await axios.get("http://localhost:5000/user/count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserCount(res.data.count);
    } catch (error) {
      toast.error("Failed to fetch user count.");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/user/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to fetch users.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleEdit = (blogId) => {
    navigate(`/EditBlog/${blogId}`);
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`http://localhost:5000/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllBlogs((prev) => prev.filter((blog) => blog._id !== blogId));
      setMyBlogs((prev) => prev.filter((blog) => blog._id !== blogId));
      setTotalBlogs((prev) => prev - 1);
      toast.success("Blog deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete blog.");
    }
  };

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  const filteredBlogs =
    selectedFilter === "all"
      ? allBlogs
      : selectedFilter === "mine"
      ? myBlogs
      : allBlogs.filter((blog) => String(blog.userId) === String(selectedFilter));

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.sidebar}>
        <h2>Admin Dashboard</h2>
        <ul>
          <li><Link to="/">🏠 Home</Link></li>
          <li><Link to="/BlogsList">📝 Create Blog</Link></li>
          <li>
            <button onClick={handleLogout} className={styles.logoutButton}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className={styles.mainContent}>
        <h1>Welcome, {user?.name || "Admin"}!</h1>
        <div className={styles.cardsContainer}>
          <div className={styles.card}><h3>Total Blogs</h3><p>{totalBlogs}</p></div>
          <div className={styles.card}><h3>My Blogs</h3><p>{myBlogs.length}</p></div>
          <div className={styles.card}><h3>Total Users</h3><p>{userCount}</p></div>
        </div>

        <div className={styles.filterSection}>
          <h2>Filter Blogs</h2>
          <select value={selectedFilter} onChange={handleFilterChange}>
            <option value="all">All Blogs</option>
            <option value="mine">My Blogs</option>
            {users.map((usr) => (
              <option key={usr._id} value={usr._id}>{usr.name}'s Blogs</option>
            ))}
          </select>
        </div>

        <h2>Blogs</h2>
        {filteredBlogs.length === 0 ? (
          <p>No blogs found.</p>
        ) : (
          <table className={styles.blogTable}>
            <thead>
              <tr><th>Title</th><th>Category</th><th>Author</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog) => (
                <tr key={blog._id}>
                  <td>{blog.title}</td>
                  <td>{blog.category}</td>
                  <td>{users.find((u) => String(u._id) === String(blog.userId))?.name }</td>
                  <td>
                    <button onClick={() => handleEdit(blog._id)} className={styles.editButton}>Edit</button>
                    <button onClick={() => handleDelete(blog._id)} className={styles.deleteButton}>Delete</button>
                    <Link to={`/blogs/${blog._id}`} className={styles.viewButton}>🔍 View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

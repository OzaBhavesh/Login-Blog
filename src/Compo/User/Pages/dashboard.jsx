import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Style/dashboard.module.css";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext"; // ✅ Import Auth Context

const UserDashboard = () => {
  const { user, token, logout } = useAuth() || {};
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !user?._id) {
      navigate("/login");
      return;
    }

    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/blogs/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlogs(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch blogs.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [token, user, navigate]);

  // ✅ Handle Delete Blog
  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axios.delete(`http://localhost:5000/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBlogs((prev) => prev.filter((blog) => blog._id !== blogId));
      toast.success("Blog deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete blog.");
    }
  };

  // ✅ Handle Edit Blog
  const handleEdit = (blogId) => navigate(`/EditBlog/${blogId}`);

  return (
    <div className={styles.dashboardContainer}>
      {/* ✅ Sidebar */}
      <div className={styles.sidebar}>
        <h2>Dashboard</h2>
        <ul>
          <li><Link to="/">🏠 Home</Link></li>
          <li><Link to="/BlogsList">📝 Create Blog</Link></li>
          <li>
            <button onClick={() => { logout(); navigate("/login"); }} className={styles.logoutButton}>
              🚪 Logout
            </button>
          </li>
        </ul>
      </div>

      {/* ✅ Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.dashboardHeader}>
          <div className={styles.userInfo}>
            <h1>Welcome, {user?.name || "User"}!</h1>
            <p>Email: {user?.email || "Not available"}</p>
            <p><strong>Total Blogs:</strong> {blogs.length}</p>
          </div>
        </div>

        {/* ✅ Blogs Table */}
        <h2>Blogs</h2>
        <div className={styles.tableContainer}>
          {loading ? <p>Loading...</p> : (
            <table className={styles.blogTable}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id}>
                    <td>{blog.title}</td>
                    <td>{blog.category}</td>
                    <td>
                      <button onClick={() => handleEdit(blog._id)} className={styles.editButton}>✏ Edit</button>
                      <button onClick={() => handleDelete(blog._id)} className={styles.deleteButton}>❌ Delete</button>
                      <Link to={`/blogs/${blog._id}`} className={styles.viewButton}>🔍 View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

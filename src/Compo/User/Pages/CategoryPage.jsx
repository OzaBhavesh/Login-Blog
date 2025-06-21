import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../style/CategoryPage.module.css";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogsByCategory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/blogs/category/${categorySlug}`
        );
        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Failed to fetch blogs for this category.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogsByCategory();
  }, [categorySlug]);

  if (loading) {
    return <p>Loading blogs...</p>;
  }

  if (!blogs.length) {
    return <p>No blogs found for the "{categorySlug}" category.</p>;
  }

  return (
    <div className={styles.categoryPage}>
      <h1>Category: {categorySlug}</h1>
      <div className={styles.blogList}>
        {blogs.map((blog) => (
          <div key={blog._id} className={styles.blogCard}>
            <h3>{blog.title}</h3>
            <p>{blog.content.substring(0, 150)}...</p>
            {/* Optionally, a link to read full blog details */}
            <a href={`/blog/${blog._id}`}>Read More</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;

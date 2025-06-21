import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../style/AllBlog.module.css";
import { toast } from "react-toastify";

const AllBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 4;
  const [commentInputs, setCommentInputs] = useState({}); // to store comment input per blog
  const navigate = useNavigate();

  // ✅ Fetch Blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/blogs/all");
        if (response.status === 200) {
          setBlogs(response.data);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  // ✅ Pagination Logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // ✅ Like blog function
  const likeBlog = async (blogId) => {
    try {
      // Call API to like the blog
      const response = await axios.post(`http://localhost:5000/blogs/${blogId}/like`);
      if (response.status === 200) {
        toast.success("Liked blog successfully!");
        // Optionally, update UI with new like count
        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog._id === blogId
              ? { ...blog, likes: response.data.likes } // assume API returns updated likes array
              : blog
          )
        );
      }
    } catch (error) {
      console.error("Error liking blog:", error);
      toast.error("Failed to like blog.");
    }
  };

  // ✅ Handle comment input change per blog
  const handleCommentChange = (blogId, value) => {
    setCommentInputs((prev) => ({ ...prev, [blogId]: value }));
  };

  // ✅ Submit comment function
  const submitComment = async (blogId) => {
    const commentText = commentInputs[blogId];
    if (!commentText || commentText.trim() === "") {
      toast.error("Please enter a comment.");
      return;
    }
    try {
      const response = await axios.post(`http://localhost:5000/blogs/${blogId}/comment`, {
        text: commentText,
      });
      if (response.status === 200) {
        toast.success("Comment added successfully!");
        // Optionally, update UI with new comment count
        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog._id === blogId
              ? { ...blog, comments: response.data.comments } // assume API returns updated comments array
              : blog
          )
        );
        // Clear comment input for this blog
        setCommentInputs((prev) => ({ ...prev, [blogId]: "" }));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Latest Blogs</h2>

      {/* ✅ Blog Grid Layout */}
      <div className={styles.blogGrid}>
        {currentBlogs.length === 0 ? (
          <p>No blogs available.</p>
        ) : (
          currentBlogs.map((blog) => (
            <div
              key={blog._id}
              className={styles.blogCard}
              onClick={() => navigate(`/blog/${blog._id}`)} // ✅ Navigate on click for full details
            >
              {/* ✅ Blog Image */}
              <div className={styles.photoContainer}>
                <img
                  className={styles.photo}
                  src={
                    blog.mediaFiles?.length > 0
                      ? `http://localhost:5000${blog.mediaFiles[0].fileUrl}`
                      : "/default.jpg"
                  }
                  alt={blog.title}
                  onError={(e) => (e.target.src = "/default.jpg")}
                />
              </div>

              {/* ✅ Blog Details */}
              <div className={styles.blogInfo}>
                <h3 className={styles.blogTitle}>{blog.title}</h3>
                <p className={styles.blogMeta}>
                  By {blog.user?.name || "Anonymous"} |{" "}
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>

                {/* ✅ Action Buttons */}
                <div className={styles.actions}>
                  <button
                    className={styles.likeBtn}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click navigation
                      likeBlog(blog._id);
                    }}
                  >
                    ❤️ {blog.likes ? blog.likes.length : 0}
                  </button>
                  <button
                    className={styles.commentBtn}
                    onClick={(e) => e.stopPropagation()} // Prevent card click navigation
                  >
                    💬 {blog.comments?.length || 0}
                  </button>
                </div>

                {/* ✅ Comment Box */}
                <div className={styles.commentBox}>
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInputs[blog._id] || ""}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCommentChange(blog._id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent card click navigation
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      submitComment(blog._id);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ Pagination Controls */}
      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={styles.pageBtn}
        >
          ⬅ Previous
        </button>
        <span className={styles.pageNumber}>Page {currentPage}</span>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              indexOfLastBlog < blogs.length ? prev + 1 : prev
            )
          }
          disabled={indexOfLastBlog >= blogs.length}
          className={styles.pageBtn}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
};

export default AllBlog;

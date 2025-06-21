import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../Style/OpenCard.module.css";
import { useAuth } from "../../context/AuthContext";

const OpenCard = () => {
  const { id } = useParams(); // ✅ Get Blog ID from URL
  const navigate = useNavigate();
  const { user, token } = useAuth() || {}; // ✅ Get logged-in user info
  const [blog, setBlog] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/blog/${id}`);
        if (response.status === 200) {
          setBlog(response.data);
        }
      } catch (error) {
       console.log(("Error fetching blog data.",error));
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  // ✅ Handle Like Button Click (Redirects to login if not authenticated)
  const handleLike = async () => {
    if (!user || !token) {
      toast.warn("Please log in to like this post.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/blogs/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBlog((prev) => ({ ...prev, likes: response.data.likes }));
      toast.success("You liked this post!");
    } catch (error) {
      toast.error("Error liking blog.");
    }
  };

  // ✅ Handle Comment Submission (Redirects to login if not authenticated)
  const handleComment = async () => {
    if (!user || !token) {
      toast.warn("Please log in to comment.");
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      toast.warn("Comment cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/blogs/${id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBlog((prev) => ({
        ...prev,
        comments: [...prev.comments, response.data.comment],
      }));

      setCommentText("");
      toast.success("Comment posted!");
    } catch (error) {
      toast.error("Error posting comment.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.cardContainer}>
      {/* ✅ Blog Image */}
      {blog?.mediaFiles?.length > 0 && (
        <div className={styles.imageContainer}>
          <img
            src={`http://localhost:5000${blog.mediaFiles[0].fileUrl}`}
            alt="Blog"
            className={styles.image}
          />
        </div>
      )}

      {/* ✅ Blog Details */}
      <h2>{blog?.title}</h2>
      <p className={styles.author}>By: {blog?.userId?.name || "Unknown"}</p>
      <p className={styles.content}>{blog?.content}</p>

      {/* ✅ Like & Comment Section */}
      <div className={styles.actions}>
        <button onClick={handleLike} className={styles.likeButton}>
          👍 {blog?.likes?.length || 0} Likes
        </button>
      </div>

      <div className={styles.commentSection}>
        <h3>Comments</h3>
        {blog?.comments?.length > 0 ? (
          blog.comments.map((comment, index) => (
            <div key={index} className={styles.comment}>
              <strong>{comment.user?.name || "User"}:</strong> {comment.text}
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}

        {/* ✅ Add Comment */}
        <textarea
          className={styles.commentInput}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
        />
        <button onClick={handleComment} className={styles.commentButton}>
          💬 Comment
        </button>
      </div>

      {/* ✅ Go Back */}
      <button onClick={() => navigate("/blogs")} className={styles.backButton}>
        🔙 Go Back
      </button>
    </div>
  );
};

export default OpenCard;

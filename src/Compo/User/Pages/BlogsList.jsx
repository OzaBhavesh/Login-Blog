import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import styles from "../Style/BlogList.module.css";

const categories = [
  "Technology", "Health", "Finance", "Education",
  "Entertainment", "Food", "Travel", "Science", "Others"
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB Limit

const CreateBlogForm = () => {
  const { user, token, logout } = useAuth() || {};
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    mediaFiles: [],
  });

  const [previews, setPreviews] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ Redirect if not authenticated
  useEffect(() => {
    if (!token || !user) {
      toast.error("Session expired. Please log in again.");
      logout();
      navigate("/login");
    }
  }, [token, user, navigate, logout]);

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle File Selection with Preview & Validation
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 5MB limit.`);
        return false;
      }
      if (!file.type.startsWith("image") && !file.type.startsWith("video")) {
        toast.error(`${file.name} is not a valid image/video file.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...validFiles],
    }));

    const newPreviews = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image") ? "image" : "video",
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
    setFileNames((prev) => [...prev, ...validFiles.map((file) => file.name)]);
  };

  // ✅ Cleanup Object URLs to Avoid Memory Leaks
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  // ✅ Remove Selected Media
  const removeMedia = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
    }));

    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFileNames((prev) => prev.filter((_, i) => i !== index));

    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      formData.mediaFiles.forEach((file, i) => {
        if (i !== index) dataTransfer.items.add(file);
      });
      fileInputRef.current.files = dataTransfer.files;
    }
  }, [formData.mediaFiles]);

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("User Data:", user);
    console.log("Form Data Before Submission:", formData);

    if (!formData.title || !formData.content || !formData.category) {
      toast.error("All fields are required!");
      setLoading(false);
      return;
    }

    if (!user || !user._id) {
      toast.error("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("content", formData.content);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("userId", user._id); // Ensure userId is set

    formData.mediaFiles.forEach((file) => {
      formDataToSend.append("mediaFiles", file);
    });

    try {
      console.log("Submitting Form Data:", Object.fromEntries(formDataToSend));

      const response = await axios.post("http://localhost:5000/blogs/create", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response:", response);

      if (response.status === 201) {
        toast.success("Blog created successfully!");
        setFormData({ title: "", content: "", category: "", mediaFiles: [] });
        setPreviews([]);
        setFileNames([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        navigate("/dashboard");
      } else {
        toast.error("Error creating blog.");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error(error.response?.data?.message || "Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formBox}>
        <h2>Create a Blog</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <select name="category" value={formData.category} onChange={handleChange} className={styles.inputField} required>
            <option value="">Select Category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>

          <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Blog Title" className={styles.inputField} required />

          <input type="file" accept="image/*,video/*" multiple onChange={handleMediaChange} className={styles.fileInput} ref={fileInputRef} />

          <ul className={styles.fileList}>
            {fileNames.map((fileName, index) => (
              <li key={index} className={styles.fileItem}>
                {fileName}
                <button className={styles.removeFileButton} type="button" onClick={() => removeMedia(index)}>✖</button>
              </li>
            ))}
          </ul>

          <div className={styles.previewContainer}>
            {previews.map((media, index) => (
              <div key={index} className={styles.previewItem}>
                {media.type === "image" ? (
                  <img src={media.url} alt={`Preview ${index}`} className={styles.imagePreview} />
                ) : (
                  <video controls className={styles.videoPreview}>
                    <source src={media.url} type="video/mp4" />
                  </video>
                )}
                <button className={styles.removeButton} type="button" onClick={() => removeMedia(index)}>✖</button>
              </div>
            ))}
          </div>

          <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Blog Content" className={styles.textareaField} rows="4" required />

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Publishing..." : "Publish Blog"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogForm;

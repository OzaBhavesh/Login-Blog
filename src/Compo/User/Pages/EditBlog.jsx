import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../style/EditBlog.module.css";
import { useAuth } from "../../context/AuthContext"; // ✅ Import Auth Context

const categories = ["Technology", "Health", "Finance", "Education", "Entertainment", "Food", "Travel", "Science", "Others"];

const EditBlog = () => {
  const { id } = useParams(); // ✅ Get Blog ID from URL
  const navigate = useNavigate();
  const { token, user } = useAuth() || {};
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ title: "", content: "", category: "", mediaFiles: [] });
  const [previews, setPreviews] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [deletedMedia, setDeletedMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      navigate("/login", { replace: true });
      return;
    }

    const storedBlog = sessionStorage.getItem(`blog_${id}`);
    if (storedBlog) {
      populateBlogData(JSON.parse(storedBlog));
      setLoading(false);
    } else {
      fetchBlog();
    }
  }, [id, token, user, navigate]);

  // ✅ Fetch Blog Data
  const fetchBlog = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/blogs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      populateBlogData(data);
      sessionStorage.setItem(`blog_${id}`, JSON.stringify(data));
    } catch (error) {
      toast.error("Error fetching blog.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Populate Blog Data
  const populateBlogData = ({ title, content, category, mediaFiles }) => {
    setFormData({ title, content, category, mediaFiles: [] });
    setExistingMedia(mediaFiles);
  };

  // ✅ Handle Input Changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Handle File Selection
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setFormData((prev) => ({ ...prev, mediaFiles: [...prev.mediaFiles, ...files] }));
    setPreviews([...previews, ...files.map((file) => ({ url: URL.createObjectURL(file), type: file.type.startsWith("image") ? "image" : "video" }))]);
  };

  // ✅ Remove Selected Media
  const removeMedia = (index) => {
    setFormData((prev) => ({ ...prev, mediaFiles: prev.mediaFiles.filter((_, i) => i !== index) }));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  // ✅ Remove Existing Media
  const removeExistingMedia = (index) => {
    setDeletedMedia([...deletedMedia, existingMedia[index]]);
    setExistingMedia(existingMedia.filter((_, i) => i !== index));
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.category) {
      toast.error("All fields are required.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("content", formData.content);
    formDataToSend.append("category", formData.category);
    formData.mediaFiles.forEach((file) => formDataToSend.append("mediaFiles", file));
    formDataToSend.append("deletedMedia", JSON.stringify(deletedMedia));

    try {
      await axios.put(`http://localhost:5000/blogs/${id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      toast.success("Blog updated successfully!");
      sessionStorage.removeItem(`blog_${id}`);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Error updating blog.");
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formBox}>
        <h2>Edit Blog</h2>
        {loading ? <p>Loading...</p> : (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <select name="category" value={formData.category} onChange={handleChange} className={styles.inputField} required>
              <option value="">Select Category</option>
              {categories.map((cat, index) => <option key={index} value={cat}>{cat}</option>)}
            </select>

            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Blog Title" className={styles.inputField} required />

            {/* ✅ Existing Media */}
            <div className={styles.existingMediaContainer}>
              {existingMedia.map((media, index) => (
                <div key={index} className={styles.previewItem}>
                  {media.fileType === "image" ? <img src={`http://localhost:5000${media.fileUrl}`} alt="Existing" className={styles.imagePreview} />
                  : <video controls className={styles.videoPreview}><source src={`http://localhost:5000${media.fileUrl}`} type="video/mp4" /></video>}
                  <button className={styles.removeButton} onClick={() => removeExistingMedia(index)}>✖</button>
                </div>
              ))}
            </div>

            {/* ✅ New File Upload */}
            <input type="file" accept="image/*,video/*" multiple onChange={handleMediaChange} className={styles.fileInput} ref={fileInputRef} />

            {/* ✅ Media Previews */}
            <div className={styles.previewContainer}>
              {previews.map((preview, index) => (
                <div key={index} className={styles.previewItem}>
                  {preview.type === "image" ? <img src={preview.url} alt="Preview" className={styles.imagePreview} />
                  : <video controls className={styles.videoPreview}><source src={preview.url} type="video/mp4" /></video>}
                  <button className={styles.removeButton} onClick={() => removeMedia(index)}>✖</button>
                </div>
              ))}
            </div>

            <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Blog Content" className={styles.textareaField} rows="4" required />

            <button type="submit" className={styles.submitButton}>Update Blog</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBlog;

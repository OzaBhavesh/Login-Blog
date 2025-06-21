const express = require("express");
const mongoose = require("mongoose");

const Blog = require("../Models/Blog.js"); // ✅ Correct Model Path
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const authMiddleware = require("../middleware/authMiddleware.js");
const router = express.Router();

// ✅ Ensure "uploads/" directory exists
const uploadPath = process.env.UPLOADS_DIR || "uploads/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
  

// ✅ Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/create", authMiddleware, upload.array("mediaFiles", 5), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.user._id; // ✅ Extract user ID from token

    console.log("Received Blog Data:", req.body);
    console.log("User ID from Token:", userId);

    if (!title || !content || !category) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (!userId) {
      return res.status(401).json({ message: "User authentication failed!" });
    }

    // ✅ Handle File Uploads
    const mediaFiles = req.files.map((file) => ({
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype.startsWith("image") ? "image" : "video",
    }));

    // ✅ Create and Save Blog
    const newBlog = new Blog({
      title,
      content,
      category,
      userId, // ✅ Attach userId from token
      mediaFiles,
    });

    await newBlog.save();
    res.status(201).json({ message: "Blog created successfully!", blog: newBlog });

  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
});

// ✅ GET: Fetch All Blogs
router.get("/all", async (req, res) => {
  try {
    const blogs = await Blog.find().populate("userId", "name email").sort({ createdAt: -1 });

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Server error!" });
  }
});

// ✅ Fetch Single Blog by ID
router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found!" });

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog." });
  }
});

// ✅ PUT: Update Blog by ID
router.put("/:id", authMiddleware, upload.array("mediaFiles", 5), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found!" });

    if (blog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this blog" });
    }

    if (req.files.length > 0) {
      blog.mediaFiles.forEach((file) => {
        const filePath = `./uploads/${file.fileUrl.split("/").pop()}`;
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      blog.mediaFiles = req.files.map((file) => ({
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype.startsWith("image") ? "image" : "video",
      }));
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.category = category || blog.category;

    await blog.save();
    res.status(200).json({ message: "Blog updated successfully!", blog });

  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Server error!" });
  }
});

// ✅ DELETE: Remove a Blog by ID
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found!" });

    if (blog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this blog" });
    }

    blog.mediaFiles.forEach((file) => {
      const filePath = `./uploads/${file.fileUrl.split("/").pop()}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted successfully!" });

  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Server error!" });
  }
});

router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUserId = req.user._id.toString(); // ✅ Ensure String Comparison

    console.log("User ID from Token:", loggedInUserId);
    console.log("Requested User ID:", userId);

    // ✅ Validate User ID Format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID format!" });
    }

    if (loggedInUserId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to blogs." });
    }

    const blogs = await Blog.find({ userId }).sort({ createdAt: -1 });

    if (blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found for this user." });
    }

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Server error." });
  }
});



module.exports = router;

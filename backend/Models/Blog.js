const mongoose = require("mongoose");

// Define Blog Schema
const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true, // Remove spaces
  },
  category: {
    type: String,
    required: true,
    enum: ["Technology", "Health", "Finance", "Education", "Entertainment", "Food", "Travel", "Science", "Others"], // Restrict categories
  },
  mediaFiles: [
    {
      fileUrl: { type: String, required: true }, // Store file URLs
      fileType: { type: String, enum: ["image", "video", "gif"], required: true }, // Identify file type
    },
  ],
  content: {
    type: String,
    required: true, // Rich text blog content
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // 👈 Foreign key reference
    ref: "User", // 👈 Reference the User model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Auto-generated timestamp
  },
});

const Blog = mongoose.model("Blog", BlogSchema);

module.exports = Blog;

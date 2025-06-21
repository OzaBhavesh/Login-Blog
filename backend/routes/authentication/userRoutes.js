const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../Models/User.js");
const authMiddleware = require("../../middleware/authMiddleware"); // ✅ Imported correctly
const authenticate = require("../../middleware/authMiddleware");
const { castObject } = require("../../Models/Blog.js");

require("dotenv").config(); // ✅ Load environment variables

const router = express.Router();

let blacklistedTokens = []; // ✅ Store invalidated tokens (Optional)

// ✅ User Registration (Sign Up)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Something went wrong. Try again later." });
  }
});

// ✅ User Login (Sign In)
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.status(200).json({
      message: "User Login successful",
      token,
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    });

  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Something went wrong. Try again later." });
  }
});

// ✅ User Logout (Invalidate Token)
router.post("/logout", authMiddleware, (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    blacklistedTokens.push(token); // ✅ Add token to blacklist
    res.status(200).json({ message: "User logged out successfully" });

  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Something went wrong. Try again later." });
  }
});

// ✅ Forgot Password Route
router.post("/ForgotPassword ", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and new password are required!" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully!" });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Something went wrong. Try again later." });
  }
});

// ✅ Get total user count
router.get("/count", authMiddleware, async (req, res) => {
  try {
    console.log('in router.get("/count"');
    const userCount = await User.countDocuments(); // ✅ Count users
    res.json({ count: userCount });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// ✅ GET: Fetch All Blogs
router.get("/all", async (req, res) => {
  try {
    const blogs = await User.find().populate("_id", "name").sort({ createdAt: -1 });

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error!" });
  }
});

// ✅ Get User by ID (Protected Route)
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    console.log('in router.get("/:userId"');
    console.log("req.params.userId: ", req.params.userId);
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error!" });
  }
});







module.exports = router;

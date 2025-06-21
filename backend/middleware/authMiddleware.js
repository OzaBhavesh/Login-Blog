const jwt = require("jsonwebtoken");
const User = require("../Models/User");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    console.log("Request Headers:", req.headers); // Debug request headers

    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "No token, authorization denied!" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
    console.log("Extracted Token:", token);

    if (!token) {
      return res.status(401).json({ message: "Invalid token format!" });
    }

    // ✅ Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    // ✅ Attach user object
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found. Invalid token." });
    }

    next(); // Proceed to next middleware
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Token is not valid!" });
  }
};

module.exports = authMiddleware;

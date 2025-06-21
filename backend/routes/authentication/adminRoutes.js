const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("./Models/User.js"); // ✅ Correct import


const router = express.Router();

// ✅ Create a New User (Sign Up)
router.get("/test",async (req,res)=>{
  return res.status(200).json({message:"admin test"})
})


module.exports = router;

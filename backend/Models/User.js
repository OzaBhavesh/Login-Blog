require('dotenv').config();
const mongoose = require('mongoose');

// Define User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

});

// Create User Model
const User = mongoose.model('User', userSchema);

module.exports = User;

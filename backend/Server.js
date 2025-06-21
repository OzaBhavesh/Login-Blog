require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const blogRoutes = require("./routes/blogRoutes");
const PORT = process.env.PORT || 3000; // Default to 5000 if PORT is not in .env


app.use(express.json()); 
app.use(express.static("uploads"));
app.use(cors({
  origin: "http://localhost:5173", // ✅ Allow frontend requests
  methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Allow HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allow headers
  credentials: true, // ✅ Allow cookies/sessions
}));

// Connect to MongoDB
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.PORT_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Stop server if connection fails
  }
};

app.get("/", (req, res) => {
  res.send("Welcome to MongoDB API");
});


//Routh and connect
const UserRoutes = require("./routes/authentication/userRoutes.js");
const BlogRoutes = require("./routes/blogRoutes.js");


app.use("/user", UserRoutes);
app.use("/Signin", UserRoutes);
app.use("/ForgotPassword", UserRoutes)


app.use(express.urlencoded({extended:false}))
app.use("/uploads", express.static("uploads"));
app.use("/blogs", blogRoutes);//get all 

app.use("/api", blogRoutes);//update




app.use("/create", blogRoutes);



// Start Server
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
  });
});

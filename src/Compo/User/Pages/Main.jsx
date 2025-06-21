import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Home from "./Home";
import AllBlog from "./Blog";
// import About from "./About";
import Signup from "../../Authentication/Signup";
import BlogsList from "./BlogsList";
import Login from "../../Authentication/Login";
import UserDashboard from "./dashboard";
import EditBlog from "./EditBlog";
import OpenCard from "./OpenCard";
import CategoryList from "./CategoryPage";



const Main = () => {
  return (
    <div>
      <Navbar />  {/* Always visible */}

      {/* Define Nested Routes */}
      <Routes>
        <Route index element={<Home />} /> {/* Default page when visiting `/` */}
             <Route path="/" element={<CategoryList />} />
      
        <Route path="blogs" element={<AllBlog />} />
        <Route path="dashboard" element={<UserDashboard />} />
        {/* <Route path="about-us" element={<About />} /> */}
        <Route path="/BlogsList" element={<BlogsList />} />
        <Route path="/EditBlog/:id" element={<EditBlog />} />
        <Route path="/blog/:id" element={<OpenCard />} />


      </Routes>

      <Footer />  {/* Always visible */}
    </div>
  );
};

export default Main;

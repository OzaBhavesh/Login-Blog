import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "../style/Home.module.css";

const categories = [
  { name: "Technology", path: "/category/technology", color: "#FF5733" },
  { name: "Health", path: "/category/health", color: "#33FF57" },
  { name: "Finance", path: "/category/finance", color: "#3380FF" },
  { name: "Education", path: "/category/education", color: "#FFC733" },
  { name: "Entertainment", path: "/category/entertainment", color: "#AA33FF" },
  { name: "Food", path: "/category/food", color: "#FF33A2" },
  { name: "Travel", path: "/category/travel", color: "#33FFC7" },
  { name: "Science", path: "/category/science", color: "#FFA533" },
  { name: "Others", path: "/category/Others", color: "#33FF57" },
];

// Duplicate categories to ensure seamless infinite scrolling
const scrollingCategories = [...categories, ...categories];

const Home = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (path, categoryName) => {
    console.log(`Category clicked: ${categoryName}`);
    navigate(path);
  };

  return (
    <div className={styles.homeContainer}>
      {/* Welcome Header */}
      <header className={styles.welcomeHeader}>
        <h1>Welcome to Our Blog!</h1>
        <p>Explore different categories and stay updated with the latest insights.</p>
      </header>

      {/* Space Between Header and Categories */}
      <div className={styles.spaceBetween}></div>

      {/* Continuous Scrolling Categories */}
      <div className={styles.categoryWrapper}>
        <motion.div
          className={styles.categoryContainer}
          animate={{ x: ["5%", "-35%"] }}
          transition={{ ease: "linear", duration: 10, repeat: Infinity }}
        >
          {scrollingCategories.map((category, index) => (
            <div
              key={index}
              className={styles.categoryBox}
              style={{ backgroundColor: category.color, cursor: "pointer" }}
         
            >
              {category.name}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;

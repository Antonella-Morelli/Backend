import React from "react";
import NavBar from "./components/navbar/BlogNavbar";
import Footer from "./components/footer/Footer";
import Home from "./views/home/Home";
import Blog from "./views/blog/Blog";
import NewBlogPost from "./views/new/New";

import Login from "./views/auth/Login"
import Register from "./views/auth/Register"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/new" element={<NewBlogPost />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 

      </Routes>
      <Footer />
    </Router>
  );
}

export default App;



import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
  return (
    <div className="home page-content">
      <div className="container">
        <motion.div
          className="hero-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">
            Welcome to the Future of Shopping
          </h1>
          <p className="hero-subtitle">
            Discover amazing products with stunning design and seamless experience
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn-primary">
              Explore Products
            </Link>
            <Link to="/register" className="btn-secondary">
              Get Started
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="features-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="feature-card glass-effect">
            <div className="feature-icon">🚀</div>
            <h3>Fast Delivery</h3>
            <p>Get your products delivered in record time</p>
          </div>
          <div className="feature-card glass-effect">
            <div className="feature-icon">🔒</div>
            <h3>Secure Payment</h3>
            <p>Your transactions are safe and encrypted</p>
          </div>
          <div className="feature-card glass-effect">
            <div className="feature-icon">⭐</div>
            <h3>Quality Products</h3>
            <p>Only the best products for our customers</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;

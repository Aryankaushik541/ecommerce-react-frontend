import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
  // Animation variants for a staggered, elegant entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    },
  };

  return (
    <div className="royal-home-page">
      {/* Background Overlay */}
      <div className="royal-bg-overlay"></div>

      <div className="container">
        <motion.div
          className="royal-hero"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={itemVariants} className="royal-pre-title">
            EST. 2025
          </motion.p>
          
          <motion.h1 variants={itemVariants} className="royal-title">
            The Imperial Collection
          </motion.h1>

          <motion.div variants={itemVariants} className="royal-divider">
            <span className="line"></span>
            <span className="diamond">♦</span>
            <span className="line"></span>
          </motion.div>

          <motion.p variants={itemVariants} className="royal-subtitle">
            Curated luxury for the discerning individual. Experience the pinnacle of design and craftsmanship.
          </motion.p>

          <motion.div variants={itemVariants} className="royal-buttons">
            <Link to="/products" className="btn-gold">
              View Collection
            </Link>
            <Link to="/register" className="btn-outline">
              Join the Elite
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="royal-features"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="luxury-card">
            <div className="icon-wrapper">⚜️</div>
            <h3>Concierge Shipping</h3>
            <p>Swift, insured delivery directly to your estate.</p>
          </div>
          <div className="luxury-card">
            <div className="icon-wrapper">🛡️</div>
            <h3>Sovereign Security</h3>
            <p>State-of-the-art encryption for your peace of mind.</p>
          </div>
          <div className="luxury-card">
            <div className="icon-wrapper">👑</div>
            <h3>Exquisite Quality</h3>
            <p>Hand-picked artifacts of uncompromising standard.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
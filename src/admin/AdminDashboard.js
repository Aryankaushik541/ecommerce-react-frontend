import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Admin.css';

const AdminDashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="royal-admin-page">
      <div className="royal-bg-overlay"></div>
      
      <div className="container">
        <motion.div 
          className="admin-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="page-title">Sovereign Control</h1>
          <div className="royal-divider">
            <span className="line"></span>
            <span className="diamond">♦</span>
            <span className="line"></span>
          </div>
          <p className="admin-subtitle">Oversee your dominion and curation.</p>
        </motion.div>
        
        <motion.div 
          className="admin-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Products Card */}
          <motion.div 
            className="royal-admin-card"
            variants={cardVariants}
            whileHover={{ y: -10, borderColor: '#fff' }}
          >
            <div className="admin-icon">🏛️</div>
            <h3>Artifact Registry</h3>
            <p>Curate and manage the inventory of exclusive items.</p>
            <Link to="/admin/products" className="btn-gold-outline">
              Manage Artifacts
            </Link>
          </motion.div>

          {/* Orders Card */}
          <motion.div 
            className="royal-admin-card"
            variants={cardVariants}
            whileHover={{ y: -10, borderColor: '#fff' }}
          >
            <div className="admin-icon">📜</div>
            <h3>Acquisitions Log</h3>
            <p>Review and process member requisitions.</p>
            <Link to="/admin/orders" className="btn-gold-outline">
              View Orders
            </Link>
          </motion.div>

          {/* Analytics Card */}
          <motion.div 
            className="royal-admin-card locked"
            variants={cardVariants}
          >
            <div className="admin-icon">📈</div>
            <h3>Treasury Data</h3>
            <p>Financial metrics and performance insights.</p>
            <button className="btn-disabled">Constructing...</button>
          </motion.div>

          {/* Customers Card */}
          <motion.div 
            className="royal-admin-card locked"
            variants={cardVariants}
          >
            <div className="admin-icon">👑</div>
            <h3>Elite Members</h3>
            <p>Manage the registry of high-profile clients.</p>
            <button className="btn-disabled">Constructing...</button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
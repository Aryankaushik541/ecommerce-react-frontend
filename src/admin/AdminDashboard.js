import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Admin.css';

const AdminDashboard = () => {
  return (
    <div className="admin-page page-content">
      <div className="container">
        <h1 className="page-title">Admin Dashboard</h1>
        
        <div className="admin-grid">
          <motion.div
            className="admin-card glass-effect"
            whileHover={{ scale: 1.05 }}
          >
            <div className="admin-icon">📦</div>
            <h3>Products</h3>
            <p>Manage your product catalog</p>
            <Link to="/admin/products" className="btn-primary">
              Manage Products
            </Link>
          </motion.div>

          <motion.div
            className="admin-card glass-effect"
            whileHover={{ scale: 1.05 }}
          >
            <div className="admin-icon">📋</div>
            <h3>Orders</h3>
            <p>View and manage customer orders</p>
            <Link to="/admin/orders" className="btn-primary">
              Manage Orders
            </Link>
          </motion.div>

          <motion.div
            className="admin-card glass-effect"
            whileHover={{ scale: 1.05 }}
          >
            <div className="admin-icon">📊</div>
            <h3>Analytics</h3>
            <p>View sales and performance metrics</p>
            <button className="btn-primary">Coming Soon</button>
          </motion.div>

          <motion.div
            className="admin-card glass-effect"
            whileHover={{ scale: 1.05 }}
          >
            <div className="admin-icon">👥</div>
            <h3>Customers</h3>
            <p>Manage customer accounts</p>
            <button className="btn-primary">Coming Soon</button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

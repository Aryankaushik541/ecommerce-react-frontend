// src/admin/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import './Admin.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Assuming backend is mounted at /api/products/ or /api/,
      // but React client uses `/products/` as before:
      const response = await api.get('/products/');
      setProducts(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching artifacts:', error.response || error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const numeric = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(numeric);
  };

  if (loading) {
    return (
      <div className="royal-loading">
        <div className="spinner-gold"></div>
      </div>
    );
  }

  return (
    <div className="royal-admin-page">
      <div className="royal-bg-overlay"></div>

      <div className="container">
        {/* Header (no more create/edit actions) */}
        <div className="admin-header-row">
          <div className="header-text">
            <h1 className="page-title">Artifact Registry</h1>
            <div className="royal-divider left-align">
              <span className="line"></span>
              <span className="diamond">♦</span>
              <span className="line"></span>
            </div>
          </div>
        </div>

        <motion.div
          className="royal-table-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <table className="royal-table">
            <thead>
              <tr>
                <th>Artifact Name</th>
                <th>Classification</th>
                <th>Valuation</th>
                <th>Inventory</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table-msg">
                    The registry is currently void.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="product-name-cell">{product.name}</td>
                    <td>{product.category_name}</td>
                    <td className="gold-text">
                      {formatCurrency(product.final_price ?? product.price)}
                    </td>
                    <td>{product.stock} Units</td>
                    <td>
                      <span
                        className={`status-badge ${
                          product.is_active ? 'active' : 'inactive'
                        }`}
                      >
                        {product.is_active ? 'Live' : 'Archived'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminProducts;

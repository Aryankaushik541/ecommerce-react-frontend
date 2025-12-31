import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants for the container (stagger effect)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Animation for individual items
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="royal-loading">
        <div className="spinner-gold"></div>
      </div>
    );
  }

  return (
    <div className="royal-products-page">
      <div className="royal-bg-overlay"></div>
      
      <div className="container">
        <div className="collection-header">
          <h1 className="page-title">The Royal Collection</h1>
          <div className="royal-divider">
            <span className="line"></span>
            <span className="diamond">♦</span>
            <span className="line"></span>
          </div>
          <p className="collection-subtitle">Curated artifacts for the modern sovereign.</p>
        </div>
        
        <motion.div 
          className="products-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="royal-product-card"
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <div className="card-image-container">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="no-image-placeholder">⚜️</div>
                )}
                <div className="card-overlay">
                  <Link to={`/products/${product.slug}`} className="btn-view-piece">
                    View Piece
                  </Link>
                </div>
              </div>

              <div className="card-info">
                <span className="card-category">{product.category_name}</span>
                <h3>{product.name}</h3>
                <div className="card-price">
                  ${product.final_price}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Products;
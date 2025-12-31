import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  
  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false); // State for Logo Popup

  useEffect(() => {
    if (user) fetchProduct();
  }, [slug, user]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${slug}/`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching artifact:', error);
    } finally {
      setProductLoading(false);
    }
  };

  // --- ACTION 1: ADD TO VAULT (Cart) ---
  const handleAddToVault = async () => {
    try {
      await api.post('/orders/cart/add/', { slug: product.slug });
      // Show Royal Notification with Logo
      setShowNotification(true);
      // Hide after 3 seconds
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      alert("Could not secure artifact.");
    }
  };

  // --- ACTION 2: ACQUIRE NOW (Buy Now) ---
  const handleBuyNow = async () => {
    try {
      await api.post('/orders/cart/add/', { slug: product.slug });
      navigate('/cart'); // Redirect immediately to Vault
    } catch (error) {
      alert("Acquisition failed.");
    }
  };

  if (authLoading || productLoading) return <div className="royal-loading"><div className="spinner-gold"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!product) return <div className="royal-loading">Artifact not found.</div>;

  return (
    <div className="royal-product-page">
      <div className="royal-bg-overlay"></div>
      
      {/* --- ROYAL NOTIFICATION POPUP --- */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            className="royal-notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="notif-content">
              <div className="notif-logo">♔</div> {/* THE BRAND LOGO */}
              <div className="notif-text">
                <h4>Secured in Vault</h4>
                <p>{product.name} has been added.</p>
              </div>
            </div>
            <Link to="/cart" className="notif-btn">View Vault</Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container">
        <Link to="/products" className="back-link">← Return to Collection</Link>
        
        <div className="royal-showcase">
          {/* Left: The Image */}
          <motion.div 
            className="showcase-image-frame"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="frame-corner top-left"></div>
            <div className="frame-corner bottom-right"></div>
            {product.image ? (
              <img src={product.image} alt={product.name} className="product-img" />
            ) : <div className="no-image-placeholder">⚜️</div>}
          </motion.div>
          
          {/* Right: The Details */}
          <motion.div 
            className="showcase-details"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="category-tag">{product.category_name || 'Exclusive Item'}</div>
            <h1 className="product-title">{product.name}</h1>
            
            <div className="royal-divider small">
              <span className="line"></span><span className="diamond">♦</span><span className="line"></span>
            </div>

            <div className="price-tag">
              <span className="current-price">${product.final_price}</span>
              {product.discount_price && <span className="old-price">${product.price}</span>}
            </div>

            <p className="product-description">{product.description}</p>
            
            <div className="inventory-status">
              <span className="label">Availability:</span>
              <span className={`value ${product.stock < 5 ? 'low-stock' : ''}`}>
                {product.stock > 0 ? `${product.stock} units remaining` : 'Out of Stock'}
              </span>
            </div>
            
            {/* --- FLIPKART STYLE BUTTON ROW --- */}
            <div className="action-buttons-row">
              <button 
                className="btn-royal btn-cart" 
                onClick={handleAddToVault}
                disabled={product.stock <= 0}
              >
                <span className="btn-icon">🛒</span> 
                {product.stock > 0 ? 'ADD TO VAULT' : 'OUT OF STOCK'}
              </button>
              
              <button 
                className="btn-royal btn-buy" 
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
              >
                <span className="btn-icon">⚡</span> 
                ACQUIRE NOW
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
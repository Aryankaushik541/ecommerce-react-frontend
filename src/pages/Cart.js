import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // FIXED: useHistory replaced with useNavigate
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api'; 

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState({}); 
  const [removingItems, setRemovingItems] = useState({});

  // FIXED: Initialize useNavigate hook
  const navigate = useNavigate(); 

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/orders/cart/');
      setCart(response.data);
    } catch (error) {
      console.error('Error opening vault:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    const previousCart = { ...cart };

    setCart(prev => {
        const updatedItems = prev.items.map(item => {
            if (item.id === itemId) {
                const itemPrice = parseFloat(item.product.final_price);
                return { 
                    ...item, 
                    quantity: newQty,
                    total_price: (itemPrice * newQty).toFixed(2)
                };
            }
            return item;
        });

        const newTotal = updatedItems.reduce((acc, item) => {
            return acc + parseFloat(item.total_price);
        }, 0).toFixed(2);

        return { ...prev, items: updatedItems, total_price: newTotal };
    });

    try {
      const response = await api.patch(`/orders/cart/update/${itemId}/`, { quantity: newQty });
      setCart(prev => ({
          ...prev,
          items: prev.items.map(item => item.id === itemId ? { ...item, ...response.data } : item)
      }));
    } catch (error) {
      setCart(previousCart);
      alert("Communication with the vault failed. Changes reverted.");
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Are you sure you wish to discard this artifact?")) return;
    setRemovingItems(prev => ({ ...prev, [itemId]: true }));

    try {
      await api.delete(`/orders/cart/remove/${itemId}/`);
      setCart((prev) => {
         const remainingItems = prev.items.filter((item) => item.id !== itemId);
         const newTotal = remainingItems.reduce((acc, item) => acc + parseFloat(item.total_price), 0).toFixed(2);
         return { ...prev, items: remainingItems, total_price: newTotal };
      });
    } catch (error) {
      alert("Could not remove item from the vault.");
    } finally {
      setRemovingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // FIXED: Checkout handler using useNavigate
  const handleProceedToCheckout = () => {
    // Navigates to the '/checkout' route in React Router v6
    navigate('/Checkout'); 
  };


  if (loading) {
    return (
      <div className="royal-loading">
        <style>{`
          .royal-loading { display: flex; justify-content: center; align-items: center; height: 100vh; background: #0a0a0a; color: #d4af37; }
          .spinner-gold { width: 50px; height: 50px; border: 3px solid rgba(212, 175, 55, 0.3); border-radius: 50%; border-top-color: #d4af37; animation: spin 1s ease-in-out infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="spinner-gold"></div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="royal-cart-page">
       <style>{`
        /* --- CSS STYLES --- */
        .royal-cart-page {
          min-height: 100vh;
          background-color: #050505;
          color: #e0e0e0;
          font-family: 'Cinzel', serif; 
          padding: 2rem;
          position: relative;
        }
        .royal-bg-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%);
          z-index: 0;
          pointer-events: none;
        }
        .container {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
        }
        .cart-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .page-title {
          font-size: 2.5rem;
          color: #d4af37;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .royal-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: #d4af37;
        }
        .royal-divider .line {
          height: 1px;
          width: 60px;
          background: linear-gradient(90deg, transparent, #d4af37, transparent);
        }
        
        /* Empty State */
        .empty-vault-container {
          display: flex;
          justify-content: center;
          padding: 4rem 0;
        }
        .empty-vault-card {
          text-align: center;
          border: 1px solid rgba(212, 175, 55, 0.2);
          padding: 3rem;
          background: rgba(20, 20, 20, 0.8);
          max-width: 500px;
        }
        .vault-icon { font-size: 3rem; margin-bottom: 1rem; }
        .btn-gold {
          background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
          color: #000;
          padding: 10px 25px;
          text-decoration: none;
          font-weight: bold;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-block;
          margin-top: 1rem;
        }
        .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4); }

        /* Layout */
        .vault-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
        }
        @media (max-width: 900px) {
          .vault-layout { grid-template-columns: 1fr; }
        }

        /* Items List */
        .vault-items-container {
          background: rgba(20, 20, 20, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.1);
          padding: 1rem;
        }
        .vault-table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          padding: 1rem;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          color: #888;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 1px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }

        .vault-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          align-items: center;
          padding: 1.5rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .row-product {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        /* --- UPDATED IMAGE SIZING --- */
        .row-image-wrapper {
          width: 120px; 
          height: 120px; 
          background: #000;
          border: 1px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0; 
        }

        @media (max-width: 600px) {
          .row-image-wrapper {
            width: 80px; 
            height: 80px;
          }
          .row-details h3 { font-size: 0.9rem; }
        }
        /* -------------------------- */

        .row-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
        .no-image-placeholder { font-size: 1.5rem; }
        
        .row-details h3 { margin: 0; font-size: 1.2rem; color: #fff; font-weight: normal; }
        .row-cat { margin: 0.25rem 0; font-size: 0.85rem; color: #888; }
        .btn-text-remove {
          background: none; border: none; color: #bf953f;
          font-size: 0.8rem; cursor: pointer; padding: 0;
          text-decoration: underline; opacity: 0.7;
          margin-top: 5px;
        }
        .btn-text-remove:hover { opacity: 1; }
        .btn-text-remove:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Quantity */
        .row-quantity { display: flex; justify-content: center; }
        .qty-selector {
          display: flex;
          align-items: center;
          border: 1px solid #333;
          background: #000;
        }
        .qty-selector button {
          background: none; border: none; color: #fff;
          width: 30px; height: 30px; cursor: pointer;
          font-size: 1.2rem;
        }
        .qty-selector button:disabled { opacity: 0.3; cursor: not-allowed; }
        .qty-selector span {
          width: 30px; text-align: center; font-size: 0.9rem;
        }
        .faded { opacity: 0.5; }

        .row-price { text-align: right; font-family: sans-serif; font-size: 1.1rem; color: #d4af37; }

        /* Summary Sticky */
        .vault-summary-sticky {
          position: sticky;
          top: 2rem;
          height: fit-content;
        }
        .summary-card {
          background: rgba(30, 30, 30, 0.9);
          border: 1px solid #d4af37;
          padding: 2rem;
        }
        .summary-title { margin-top: 0; color: #d4af37; font-weight: normal; text-align: center; margin-bottom: 1.5rem; }
        .summary-row {
          display: flex; justify-content: space-between;
          margin-bottom: 1rem; font-size: 0.95rem; color: #ccc;
        }
        .summary-divider { height: 1px; background: rgba(212, 175, 55, 0.3); margin: 1.5rem 0; }
        .summary-row.total { font-size: 1.2rem; color: #fff; }
        .gold-text { color: #d4af37; }
        .full-width { width: 100%; display: block; text-align: center; margin-top: 1rem; padding: 15px; }
        .secure-badges {
          display: flex; justify-content: space-between;
          margin-top: 1.5rem; font-size: 0.7rem; color: #666;
        }
      `}</style>
      
      <div className="royal-bg-overlay"></div>
      
      <div className="container">
        <motion.div 
          className="cart-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="page-title">Your Private Vault</h1>
          <div className="royal-divider">
            <span className="line"></span>
            <span className="diamond">♦</span>
            <span className="line"></span>
          </div>
        </motion.div>

        {isEmpty ? (
          <motion.div 
            className="empty-vault-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="empty-vault-card">
              <div className="vault-icon">⚜️</div>
              <h2>Your Collection is Void</h2>
              <p className="cart-subtitle">
                The vault awaits your curation. Discover our artifacts of distinction.
              </p>
              <Link to="/products" className="btn-gold">
                Browse the Collection
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="vault-layout">
            
            {/* LEFT COLUMN: Items Table Format */}
            <div className="vault-items-container">
              <div className="vault-table-header">
                <span>Artifact</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Price</span>
              </div>

              <AnimatePresence>
                {cart.items.map((item) => (
                  <motion.div 
                    key={item.id}
                    className="vault-row"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    layout
                  >
                    {/* 1. Product Info */}
                    <div className="row-product">
                      <div className="row-image-wrapper">
                        {item.image_url ? (
                          <img 
                            src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:8000${item.image_url}`} 
                            alt={item.product.name} 
                          />
                        ) : (
                          <div className="no-image-placeholder">⚜️</div>
                        )}
                      </div>
                      <div className="row-details">
                        <h3>{item.product.name}</h3>
                        <p className="row-cat">{item.product.category_name}</p>
                        <button 
                          className="btn-text-remove"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removingItems[item.id]}
                        >
                          {removingItems[item.id] ? 'Discarding...' : 'Remove'}
                        </button>
                      </div>
                    </div>

                    {/* 2. Quantity Controls */}
                    <div className="row-quantity">
                      <div className="qty-selector">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          disabled={updatingItems[item.id] || item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className={updatingItems[item.id] ? 'faded' : ''}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          disabled={updatingItems[item.id]}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 3. Price */}
                    <div className="row-price">
                      <span className="unit-price">${item.total_price}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* RIGHT COLUMN: Summary Card */}
            <motion.div 
              className="vault-summary-sticky"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="summary-card">
                <h3 className="summary-title">Acquisition Summary</h3>
                
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${cart.total_price}</span>
                </div>
                <div className="summary-row">
                  <span>Concierge Shipping</span>
                  <span>Complimentary</span>
                </div>
                <div className="summary-row">
                  <span>Taxes (Estimated)</span>
                  <span>$0.00</span>
                </div>

                <div className="summary-divider"></div>
                
                <div className="summary-row total">
                  <span>Total Valuation</span>
                  <span className="gold-text">${cart.total_price}</span>
                </div>

                <button 
                    className="btn-gold full-width"
                    onClick={handleProceedToCheckout} // FIXED: Using the new handler
                >
                  Proceed to Secure Checkout
                </button>
                
                <div className="secure-badges">
                  <span>🔒 256-bit Encryption</span>
                  <span>🛡️ Verified Vault</span>
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
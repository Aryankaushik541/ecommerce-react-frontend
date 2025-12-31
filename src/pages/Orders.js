// src/pages/Orders.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/'); // hits /api/orders/
      const data = response.data.results || response.data; // paginated or not
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch order history:', err);

      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('Your session has expired or you are not logged in. Please log in again.');
      } else {
        setError('Could not retrieve your order history. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const numericAmount = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(numericAmount);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered':
        return { color: '#00cc66', border: '1px solid #00cc66' };
      case 'shipped':
        return { color: '#3399ff', border: '1px solid #3399ff' };
      case 'processing':
        return { color: '#d4af37', border: '1px solid #d4af37' };
      case 'cancelled':
        return { color: '#ff4d4d', border: '1px solid #ff4d4d' };
      case 'pending':
      default:
        return { color: '#aaaaaa', border: '1px solid #aaaaaa' };
    }
  };

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  // Filter + sort derived orders
  const preparedOrders = useMemo(() => {
    let list = [...orders];

    if (statusFilter !== 'all') {
      list = list.filter(
        (order) => (order.status || '').toLowerCase() === statusFilter
      );
    }

    list.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      const amtA = Number(a.total_amount) || 0;
      const amtB = Number(b.total_amount) || 0;

      switch (sortOption) {
        case 'oldest':
          return dateA - dateB;
        case 'amountHigh':
          return amtB - amtA;
        case 'amountLow':
          return amtA - amtB;
        case 'newest':
        default:
          return dateB - dateA;
      }
    });

    return list;
  }, [orders, statusFilter, sortOption]);

  // -------------------------
  // Loading State
  // -------------------------
  if (loading) {
    return (
      <div className="royal-orders-page royal-loading">
        <style>{LOADING_STYLES}</style>
        <div className="spinner-gold"></div>
      </div>
    );
  }

  // -------------------------
  // Error State
  // -------------------------
  if (error) {
    return (
      <div className="royal-orders-page container error-message">
        <style>{ROYAL_THEME_STYLES}</style>

        <h1 className="page-title">Order History</h1>
        <div className="royal-divider">
          <span className="line"></span>
          <span className="diamond">♦</span>
          <span className="line"></span>
        </div>

        <p
          style={{
            color: '#ff6666',
            textAlign: 'center',
            margin: '2rem 0',
          }}
        >
          {error}
        </p>

        <motion.button
          className="btn-gold"
          onClick={() => navigate('/login')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Proceed to Login
        </motion.button>

        <motion.button
          className="btn-gold btn-secondary"
          onClick={fetchOrders}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginLeft: '1rem' }}
        >
          Retry
        </motion.button>
      </div>
    );
  }

  // -------------------------
  // Main Render
  // -------------------------
  return (
    <div className="royal-orders-page">
      <style>{ROYAL_THEME_STYLES}</style>
      <div className="royal-bg-overlay"></div>

      <div className="container">
        <motion.h1
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Order History
        </motion.h1>

        <div className="royal-divider">
          <span className="line"></span>
          <span className="diamond">♦</span>
          <span className="line"></span>
        </div>

        {/* Filter + Sort Toolbar */}
        <motion.div
          className="orders-toolbar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="status-filters">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'processing', label: 'Processing' },
              { key: 'shipped', label: 'Shipped' },
              { key: 'delivered', label: 'Delivered' },
              { key: 'cancelled', label: 'Cancelled' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className={`status-filter-btn ${
                  statusFilter === item.key ? 'active' : ''
                }`}
                onClick={() => setStatusFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="sort-wrapper">
            <label htmlFor="order-sort" className="sort-label">
              Sort by:
            </label>
            <select
              id="order-sort"
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amountHigh">Amount: High to Low</option>
              <option value="amountLow">Amount: Low to High</option>
            </select>
          </div>
        </motion.div>

        {preparedOrders.length === 0 ? (
          <motion.div
            className="empty-orders"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>The Archive is Quiet</h2>
            <p>
              No past acquisitions found with the current filters. Adjust filters
              or begin your collection today.
            </p>
            <motion.button
              className="btn-gold"
              onClick={() => navigate('/products')}
            >
              Browse Artifacts
            </motion.button>
          </motion.div>
        ) : (
          <table className="orders-table">
            <thead>
              <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <th>Order Number</th>
                <th>Date Placed</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Action</th>
              </motion.tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {preparedOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="order-row"
                  >
                    <td className="number-col">{order.order_number}</td>
                    <td className="date-col">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : '--'}
                    </td>
                    <td>
                      <span
                        className="status-pill"
                        style={getStatusStyle(order.status)}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="total-col">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-view-details"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order.id);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Orders;

// ===========================================
// CSS Styles (inline for this page)
// ===========================================

const LOADING_STYLES = `
  .royal-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #0a0a0a;
    color: #d4af37;
    font-family: 'Cinzel', serif;
  }
  .spinner-gold {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(212, 175, 55, 0.3);
    border-radius: 50%;
    border-top-color: #d4af37;
    animation: spin 1s ease-in-out infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const ROYAL_THEME_STYLES = `
  .royal-orders-page {
    min-height: 100vh;
    background-color: #050505;
    color: #e0e0e0;
    font-family: 'Cinzel', serif;
    padding: 4rem 2rem;
    position: relative;
    background-image: radial-gradient(circle, #1a1a1a 1px, transparent 1px);
    background-size: 20px 20px;
  }
  .royal-bg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 0;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    z-index: 1;
    position: relative;
  }
  .page-title {
    color: #d4af37;
    text-transform: uppercase;
    letter-spacing: 3px;
    text-align: center;
    margin-bottom: 1rem;
    font-size: 3rem;
    text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
  }
  .royal-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 3rem auto;
    max-width: 300px;
  }
  .royal-divider .line {
    flex-grow: 1;
    height: 1px;
    background-color: rgba(212, 175, 55, 0.3);
  }
  .royal-divider .diamond {
    color: #d4af37;
    font-size: 1rem;
    margin: 0 15px;
    filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.8));
  }

  /* Toolbar */
  .orders-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .status-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .status-filter-btn {
    background: transparent;
    border: 1px solid rgba(212, 175, 55, 0.4);
    color: #e0e0e0;
    padding: 6px 12px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .status-filter-btn:hover {
    background: rgba(212, 175, 55, 0.15);
  }
  .status-filter-btn.active {
    background: linear-gradient(135deg, #bf953f, #fcf6ba);
    color: #000;
    border-color: #fcf6ba;
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
  }
  .sort-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .sort-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #c0c0c0;
  }
  .sort-select {
    background: rgba(20, 20, 20, 0.85);
    border: 1px solid rgba(212, 175, 55, 0.4);
    color: #e0e0e0;
    padding: 6px 10px;
    font-size: 0.85rem;
    outline: none;
  }

  /* Table Styling */
  .orders-table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(20, 20, 20, 0.85);
    border: 2px solid rgba(212, 175, 55, 0.3);
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
  }
  .orders-table th,
  .orders-table td {
    padding: 18px 20px;
    text-align: left;
    border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  }
  .orders-table th {
    background-color: rgba(212, 175, 55, 0.15);
    color: #d4af37;
    text-transform: uppercase;
    font-size: 0.95rem;
    letter-spacing: 1.5px;
  }
  .orders-table tr {
    cursor: pointer;
  }
  .orders-table tr:hover {
    background-color: rgba(212, 175, 55, 0.1);
  }
  .orders-table .date-col {
    font-size: 0.9rem;
    color: #aaa;
  }
  .orders-table .total-col {
    color: #fcf6ba;
    font-weight: bold;
    font-family: 'Times New Roman', serif;
    font-size: 1.1rem;
  }
  .orders-table .number-col {
    color: #fff;
    font-weight: bold;
  }

  /* Status Pill */
  .status-pill {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Empty State */
  .empty-orders {
    text-align: center;
    padding: 5rem 2rem;
    border: 2px dashed rgba(212, 175, 55, 0.5);
    background: rgba(10, 10, 10, 0.9);
    color: #fff;
  }
  .empty-orders h2 {
    color: #d4af37;
  }

  /* Buttons */
  .btn-gold {
    background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
    color: #000;
    padding: 12px 30px;
    text-decoration: none;
    font-weight: bold;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-block;
    margin-top: 2rem;
    border-radius: 2px;
    box-shadow: 0 4px 10px rgba(212, 175, 55, 0.3);
    font-family: 'Cinzel', serif;
  }
  .btn-gold:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(212, 175, 55, 0.6);
  }

  .btn-gold.btn-secondary {
    margin-top: 0;
    background: transparent;
    border: 1px solid rgba(212, 175, 55, 0.6);
    color: #d4af37;
    box-shadow: none;
  }
  .btn-gold.btn-secondary:hover {
    background: rgba(212, 175, 55, 0.15);
  }

  .btn-view-details {
    padding: 6px 14px;
    font-size: 0.8rem;
    text-transform: uppercase;
    border-radius: 2px;
    border: 1px solid rgba(212, 175, 55, 0.7);
    background: transparent;
    color: #fcf6ba;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-view-details:hover {
    background: rgba(212, 175, 55, 0.2);
  }

  .order-row td:last-child {
    text-align: right;
  }

  @media (max-width: 768px) {
    .orders-toolbar {
      flex-direction: column;
      align-items: flex-start;
    }
    .orders-table th,
    .orders-table td {
      padding: 12px 10px;
    }
    .page-title {
      font-size: 2.2rem;
    }
  }
`;

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/'); // -> /api/orders/
      const data = res.data.results || res.data;
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Unable to retrieve orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`); // <-- orderId used here
  };

  const formatCurrency = (amount) => {
    const numericAmount = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(numericAmount);
  };

  const getStatusStyle = (status) => {
    switch ((status || '').toLowerCase()) {
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

  const preparedOrders = useMemo(() => {
    let list = [...orders];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) =>
        (o.order_number || `${o.id}` || '')
          .toLowerCase()
          .includes(q) ||
        (o.user_email || o.customer_email || '')
          .toLowerCase()
          .includes(q)
      );
    }

    list.sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt);
      const dateB = new Date(b.created_at || b.createdAt);
      const totalA = Number(a.total_amount || a.totalAmount) || 0;
      const totalB = Number(b.total_amount || b.totalAmount) || 0;

      switch (sortOption) {
        case 'oldest':
          return dateA - dateB;
        case 'amountHigh':
          return totalB - totalA;
        case 'amountLow':
          return totalA - totalB;
        case 'newest':
        default:
          return dateB - dateA;
      }
    });

    return list;
  }, [orders, search, sortOption]);

  if (loading) {
    return (
      <div className="royal-admin-page royal-loading">
        <style>{ADMIN_ORDERS_STYLES}</style>
        <div className="royal-bg-overlay"></div>
        <div className="container">
          <h1 className="page-title">Loading Orders...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="royal-admin-page">
        <style>{ADMIN_ORDERS_STYLES}</style>
        <div className="royal-bg-overlay"></div>
        <div className="container">
          <h1 className="page-title">Imperial Orders Log</h1>
          <p style={{ color: '#ff6666', marginTop: '1.5rem' }}>{error}</p>
          <button className="btn-gold" onClick={fetchOrders}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="royal-admin-page">
      <style>{ADMIN_ORDERS_STYLES}</style>
      <div className="royal-bg-overlay"></div>

      <div className="container">
        <div className="admin-header">
          <h1 className="page-title">Imperial Orders Log</h1>
          <div className="royal-divider">
            <span className="line"></span>
            <span className="diamond">♦</span>
            <span className="line"></span>
          </div>
        </div>

        <motion.div
          className="products-toolbar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            type="text"
            placeholder="Search by order # or email..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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

        <table className="products-table">
          <thead>
            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <th>Order #</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Placed</th>
              <th>Action</th>
            </motion.tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {preparedOrders.map((o) => (
                <motion.tr
                  key={o.id}
                  onClick={() => handleRowClick(o.id)} // <-- orderId
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="product-row"
                >
                  <td className="title-col">
                    {o.order_number || `#${o.id}`}
                  </td>
                  <td>{o.user_email || o.customer_email || '--'}</td>
                  <td className="price-col">
                    {formatCurrency(o.total_amount || o.totalAmount)}
                  </td>
                  <td>
                    <span
                      className="status-pill"
                      style={getStatusStyle(o.status)}
                    >
                      {o.status || '—'}
                    </span>
                  </td>
                  <td>
                    {o.created_at || o.createdAt
                      ? new Date(o.created_at || o.createdAt).toLocaleString()
                      : '--'}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-view-details"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(o.id);
                      }}
                    >
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;

const ADMIN_ORDERS_STYLES = `
  .royal-admin-page {
    min-height: 100vh;
    background-color: #050505;
    color: #e0e0e0;
    font-family: 'Cinzel', serif;
    padding: 2rem;
    position: relative;
  }
  .royal-bg-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 0;
  }
  .container {
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }
  .admin-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .page-title {
    color: #d4af37;
    text-transform: uppercase;
    letter-spacing: 3px;
    font-size: 2.4rem;
  }
  .royal-divider {
    display:flex;
    align-items:center;
    justify-content:center;
    margin:1rem auto 2rem auto;
    max-width:300px;
  }
  .royal-divider .line {
    flex-grow:1;
    height:1px;
    background-color:rgba(212,175,55,0.3);
  }
  .royal-divider .diamond {
    color:#d4af37;
    font-size:1rem;
    margin:0 12px;
    filter:drop-shadow(0 0 5px rgba(212,175,55,0.8));
  }

  .products-toolbar {
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:1rem;
    margin-bottom:1.5rem;
    flex-wrap:wrap;
  }
  .search-input {
    flex:1;
    min-width:220px;
    background:#111;
    border:1px solid rgba(212,175,55,0.4);
    padding:8px 12px;
    color:#e0e0e0;
    font-family:'Cinzel', serif;
  }
  .sort-wrapper {
    display:flex;
    align-items:center;
    gap:0.5rem;
  }
  .sort-label {
    font-size:0.8rem;
    text-transform:uppercase;
    letter-spacing:1px;
    color:#c0c0c0;
  }
  .sort-select {
    background:#141414;
    border:1px solid rgba(212,175,55,0.4);
    color:#e0e0e0;
    padding:6px 10px;
    font-size:0.85rem;
  }

  .products-table {
    width:100%;
    border-collapse:collapse;
    background:rgba(15,15,15,0.95);
    border:2px solid rgba(212,175,55,0.3);
    box-shadow:0 0 25px rgba(0,0,0,0.7);
  }
  .products-table th,
  .products-table td {
    padding:14px 16px;
    border-bottom:1px solid rgba(212,175,55,0.12);
    font-size:0.9rem;
  }
  .products-table th {
    background:rgba(212,175,55,0.15);
    color:#d4af37;
    text-transform:uppercase;
    letter-spacing:1.2px;
    font-size:0.8rem;
  }
  .product-row {
    cursor:pointer;
  }
  .product-row:hover {
    background:rgba(212,175,55,0.1);
  }
  .title-col {
    font-weight:600;
  }
  .price-col {
    color:#fcf6ba;
    font-weight:600;
  }

  .status-pill {
    display:inline-block;
    padding:4px 10px;
    border-radius:14px;
    font-size:0.7rem;
    text-transform:uppercase;
    letter-spacing:0.6px;
    border:1px solid #777;
  }

  .btn-gold {
    background:linear-gradient(135deg,#bf953f,#fcf6ba,#b38728,#fbf5b7,#aa771c);
    color:#000;
    padding:10px 24px;
    border:none;
    cursor:pointer;
    text-transform:uppercase;
    font-weight:bold;
    box-shadow:0 4px 10px rgba(212,175,55,0.3);
  }
  .btn-gold:hover {
    transform:translateY(-2px);
    box-shadow:0 8px 18px rgba(212,175,55,0.6);
  }

  .btn-view-details {
    padding:6px 14px;
    font-size:0.75rem;
    text-transform:uppercase;
    border-radius:2px;
    border:1px solid rgba(212,175,55,0.7);
    background:transparent;
    color:#fcf6ba;
    cursor:pointer;
    transition:all 0.2s ease;
  }
  .btn-view-details:hover {
    background:rgba(212,175,55,0.2);
  }

  .royal-loading {
    display:flex;
    justify-content:center;
    align-items:center;
  }

  @media (max-width: 768px) {
    .products-table th,
    .products-table td {
      padding:10px 8px;
    }
  }
`;

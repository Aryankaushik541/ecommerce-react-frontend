import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const AdminOrderDetail = () => {
  const { orderId } = useParams(); // now using orderId
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  // Fetch order
  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setError('Invalid order ID in URL.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/orders/${orderId}/`); // -> /api/orders/:id/
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to fetch order:', err.response || err);
      setError('Could not retrieve order. Check ID or permissions.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleChange = (field, value) => {
    setOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveMessage('');
  };

  // Example: toggling an "is_active" flag on order (optional, keep if you use it)
  const handleToggleActive = () => {
    setOrder((prev) => ({
      ...prev,
      is_active: !prev.is_active,
    }));
    setSaveMessage('');
  };

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    setSaveMessage('');
    try {
      await api.put(`/orders/${order.id}/`, order); // adjust to PATCH if needed
      setSaveMessage('Changes have been decreed successfully.');
    } catch (err) {
      console.error('Error saving order:', err.response || err);
      setSaveMessage('Saving failed. Please review fields or try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    const numeric = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(numeric);
  };

  // ---------------- Loading ----------------
  if (loading) {
    return (
      <div className="royal-admin-page royal-loading">
        <style>{ADMIN_ORDER_DETAIL_STYLES}</style>
        <div className="royal-bg-overlay"></div>
        <div className="container">
          <h1 className="page-title">Summoning Decree...</h1>
        </div>
      </div>
    );
  }

  // ---------------- Error ----------------
  if (error || !order) {
    return (
      <div className="royal-admin-page">
        <style>{ADMIN_ORDER_DETAIL_STYLES}</style>
        <div className="royal-bg-overlay"></div>
        <div className="container">
          <h1 className="page-title">Order Decree</h1>
          <p style={{ color: '#ff6666', marginTop: '1.5rem' }}>
            {error || 'Order not found.'}
          </p>
          <button
            className="btn-back-admin"
            onClick={() => navigate('/admin/orders')}
          >
            &larr; Back to Log
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="royal-admin-page">
      <style>{ADMIN_ORDER_DETAIL_STYLES}</style>
      <div className="royal-bg-overlay"></div>

      <div className="container">
        <div className="admin-header">
          <button
            className="btn-back-admin"
            onClick={() => navigate('/admin/orders')}
          >
            &larr; Back to Log
          </button>
          <h1 className="page-title">Order Decree #{order.id}</h1>
          <div className="royal-divider">
            <span className="line"></span>
            <span className="diamond">♦</span>
            <span className="line"></span>
          </div>
        </div>

        <motion.div
          className="product-detail-layout"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* LEFT: Core Info */}
          <div className="detail-column core-info">
            <h3 className="section-header">Essence</h3>

            <label className="field-label">Order Number</label>
            <input
              type="text"
              className="field-input"
              value={order.order_number || ''}
              onChange={(e) => handleChange('order_number', e.target.value)}
            />

            <label className="field-label">Customer Email</label>
            <input
              type="text"
              className="field-input"
              value={order.user_email || ''}
              onChange={(e) => handleChange('user_email', e.target.value)}
            />

            <label className="field-label">Notes</label>
            <textarea
              className="field-textarea"
              rows={4}
              value={order.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>

          {/* RIGHT: Commerce & Status */}
          <div className="detail-column commerce-info">
            <h3 className="section-header">Commerce & Status</h3>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Total Amount</label>
                <input
                  type="number"
                  className="field-input"
                  value={order.total_amount ?? ''}
                  onChange={(e) => handleChange('total_amount', e.target.value)}
                />
                <div className="field-hint">
                  {formatCurrency(order.total_amount || 0)}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Payment Method</label>
                <input
                  type="text"
                  className="field-input"
                  value={order.payment_method || ''}
                  onChange={(e) => handleChange('payment_method', e.target.value)}
                />
              </div>
            </div>

            {/* HERE: Payment Status + Order Status as SELECTS */}
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Payment Status</label>
                <select
                  className="field-input"
                  value={order.payment_status || ''}
                  onChange={(e) => handleChange('payment_status', e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Order Status</label>
                <select
                  className="field-input"
                  value={order.status || ''}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="field-group toggle-group">
              <label className="field-label">Active</label>
              <button
                type="button"
                className={`status-toggle-btn ${
                  order.is_active ? 'active' : 'inactive'
                }`}
                onClick={handleToggleActive}
              >
                {order.is_active ? 'Active Decree' : 'Inactive Decree'}
              </button>
            </div>

            <div className="save-bar">
              {saveMessage && (
                <span
                  className="save-message"
                  style={{
                    color: saveMessage.includes('failed') ? '#ff6666' : '#d4af37',
                  }}
                >
                  {saveMessage}
                </span>
              )}
              <button
                type="button"
                className="btn-gold"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Decreeing...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;

const ADMIN_ORDER_DETAIL_STYLES = `
  .royal-admin-page {
    min-height:100vh;
    background:#050505;
    color:#e0e0e0;
    font-family:'Cinzel', serif;
    padding:2rem;
    position:relative;
  }
  .royal-bg-overlay {
    position:absolute;
    inset:0;
    background:rgba(0,0,0,0.4);
    z-index:0;
  }
  .container {
    max-width:1200px;
    margin:0 auto;
    position:relative;
    z-index:1;
  }
  .admin-header {
    text-align:center;
    margin-bottom:2rem;
    position:relative;
  }
  .page-title {
    color:#d4af37;
    text-transform:uppercase;
    letter-spacing:3px;
    font-size:2.4rem;
  }
  .royal-divider {
    display:flex;
    align-items:center;
    justify-content:center;
    margin:1rem auto 2.2rem auto;
    max-width:260px;
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
  .btn-back-admin {
    position:absolute;
    left:0;
    top:0;
    transform:translateY(10px);
    background:#333;
    color:#ccc;
    border:1px solid #555;
    padding:8px 15px;
    cursor:pointer;
    transition:all 0.2s;
    font-family:'Cinzel', serif;
  }
  .btn-back-admin:hover {
    background:#444;
    color:#d4af37;
  }

  .product-detail-layout {
    display:grid;
    grid-template-columns:1.3fr 1fr;
    gap:2.5rem;
    background:rgba(10,10,10,0.9);
    padding:2rem;
    border:2px solid rgba(212,175,55,0.3);
  }
  @media (max-width: 1000px) {
    .product-detail-layout {
      grid-template-columns:1fr;
    }
  }
  .detail-column {
    min-width:0;
  }
  .section-header {
    border-bottom:1px solid rgba(212,175,55,0.3);
    padding-bottom:10px;
    margin-bottom:1.5rem;
    color:#fff;
    font-size:1.2rem;
  }

  .field-label {
    display:block;
    font-size:0.8rem;
    text-transform:uppercase;
    letter-spacing:1px;
    color:#c0c0c0;
    margin-bottom:4px;
    margin-top:14px;
  }
  .field-input,
  .field-textarea {
    width:100%;
    background:#111;
    border:1px solid rgba(212,175,55,0.35);
    color:#e0e0e0;
    padding:8px 10px;
    font-family:'Cinzel', serif;
    font-size:0.9rem;
  }
  .field-textarea {
    resize:vertical;
  }
  .field-row {
    display:flex;
    gap:1rem;
    flex-wrap:wrap;
  }
  .field-group {
    flex:1;
    min-width:0;
  }
  .field-hint {
    font-size:0.75rem;
    color:#aaa;
    margin-top:3px;
  }

  .toggle-group {
    margin-top:1.5rem;
  }
  .status-toggle-btn {
    margin-top:4px;
    padding:10px 14px;
    border:none;
    cursor:pointer;
    text-transform:uppercase;
    font-size:0.8rem;
    letter-spacing:1px;
    font-family:'Cinzel', serif;
    transition:all 0.2s;
  }
  .status-toggle-btn.active {
    background:#0c3b1a;
    color:#7bffb3;
    border:1px solid #00cc66;
  }
  .status-toggle-btn.inactive {
    background:#3b1010;
    color:#ffb3b3;
    border:1px solid #ff4d4d;
  }

  .save-bar {
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-top:2rem;
    gap:1rem;
    flex-wrap:wrap;
  }
  .save-message {
    font-size:0.8rem;
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
    font-family:'Cinzel', serif;
    font-size:0.85rem;
  }
  .btn-gold[disabled] {
    opacity:0.7;
    cursor:wait;
  }
  .btn-gold:hover:not([disabled]) {
    transform:translateY(-2px);
    box-shadow:0 8px 18px rgba(212,175,55,0.6);
  }

  .royal-loading {
    display:flex;
    justify-content:center;
    align-items:center;
  }
`;

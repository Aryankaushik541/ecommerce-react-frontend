import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/orders/${orderId}/`); // DRF: /api/orders/:id/
      setOrder(response.data || null);
    } catch (err) {
      console.error('Failed to fetch order detail:', err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('Your session has expired or you are not logged in. Please log in again.');
      } else if (err.response && err.response.status === 404) {
        setError('This order could not be found. It may have been removed or does not exist.');
      } else {
        setError('We were unable to retrieve the details for this order. Please try again later.');
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

  // Try to normalise items array from various possible keys
  const items = useMemo(() => {
    if (!order) return [];
    return (
      order.items ||
      order.order_items ||
      order.orderItems ||
      []
    );
  }, [order]);

  // --------------- Loading State ---------------
  if (loading) {
    return (
      <div className="royal-order-detail-page royal-loading">
        <style>{ORDER_LOADING_STYLES}</style>
        <div className="spinner-gold"></div>
      </div>
    );
  }

  // --------------- Error State ---------------
  if (error) {
    return (
      <div className="royal-order-detail-page">
        <style>{ORDER_DETAIL_STYLES}</style>
        <div className="royal-bg-overlay"></div>

        <div className="container">
          <motion.h1
            className="page-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Order Detail
          </motion.h1>

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

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <motion.button
              className="btn-gold btn-secondary"
              onClick={() => navigate('/orders')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Back to Orders
            </motion.button>

            <motion.button
              className="btn-gold"
              onClick={fetchOrderDetail}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginLeft: '1rem' }}
            >
              Retry
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const status = order.status || 'Unknown';
  const orderNumber = order.order_number || order.orderNumber || `#${order.id}`;
  const createdDate = order.created_at || order.createdAt;
  const totalAmount = order.total_amount || order.totalAmount || 0;
  const paymentMethod = order.payment_method || order.paymentMethod || '—';
  const paymentStatus = order.payment_status || order.paymentStatus || '—';

  // Try to build a readable shipping address from possible fields
  const addressLines = [];
  const shipping = order.shipping_address || order.shippingAddress || order.address || {};

  if (shipping.name) addressLines.push(shipping.name);
  if (shipping.phone || shipping.mobile) {
    addressLines.push(`☎ ${shipping.phone || shipping.mobile}`);
  }
  const lineParts = [
    shipping.address_line1 || shipping.line1,
    shipping.address_line2 || shipping.line2,
  ].filter(Boolean);
  if (lineParts.length) addressLines.push(lineParts.join(', '));

  const cityStatePin = [
    shipping.city,
    shipping.state,
    shipping.postal_code || shipping.pincode || shipping.zip,
  ].filter(Boolean);
  if (cityStatePin.length) addressLines.push(cityStatePin.join(', '));

  if (shipping.country) addressLines.push(shipping.country);

  return (
    <div className="royal-order-detail-page">
      <style>{ORDER_DETAIL_STYLES}</style>
      <div className="royal-bg-overlay"></div>

      <div className="container">
        {/* Header */}
        <motion.div
          className="detail-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="page-title">Order Detail</h1>
          <div className="royal-divider">
            <span className="line"></span>
            <span className="diamond">♦</span>
            <span className="line"></span>
          </div>

          <div className="header-meta">
            <div>
              <span className="label">Order Number</span>
              <span className="value important">{orderNumber}</span>
            </div>
            <div>
              <span className="label">Placed On</span>
              <span className="value">
                {createdDate
                  ? new Date(createdDate).toLocaleString()
                  : '--'}
              </span>
            </div>
            <div>
              <span className="label">Status</span>
              <span
                className="status-pill"
                style={getStatusStyle(status)}
              >
                {status}
              </span>
            </div>
            <div>
              <span className="label">Total</span>
              <span className="value important">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Layout */}
        <motion.div
          className="detail-layout"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Left: Items */}
          <div className="detail-card items-card">
            <h2 className="card-title">Items in This Order</h2>
            {items.length === 0 ? (
              <p className="muted">No line items found for this order.</p>
            ) : (
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const name =
                      item.product_name ||
                      item.name ||
                      item.title ||
                      `Item #${index + 1}`;
                    const qty = item.quantity || item.qty || 1;
                    const price =
                      item.unit_price ||
                      item.price ||
                      item.unitPrice ||
                      0;
                    const subtotal =
                      item.line_total ||
                      item.subtotal ||
                      item.total ||
                      price * qty;

                    return (
                      <tr key={item.id || index}>
                        <td className="item-name">{name}</td>
                        <td>{qty}</td>
                        <td>{formatCurrency(price)}</td>
                        <td className="item-subtotal">
                          {formatCurrency(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Right: Summary / Address / Payment */}
          <div className="detail-card side-card">
            <h2 className="card-title">Order Summary</h2>

            <div className="summary-row">
              <span className="label">Items Total</span>
              <span className="value">
                {formatCurrency(order.items_total || order.subtotal || totalAmount)}
              </span>
            </div>

            {order.shipping_amount != null && (
              <div className="summary-row">
                <span className="label">Shipping</span>
                <span className="value">
                  {formatCurrency(order.shipping_amount)}
                </span>
              </div>
            )}

            {order.tax_amount != null && (
              <div className="summary-row">
                <span className="label">Tax</span>
                <span className="value">
                  {formatCurrency(order.tax_amount)}
                </span>
              </div>
            )}

            <div className="summary-row total-row">
              <span className="label">Grand Total</span>
              <span className="value important">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <hr className="divider-light" />

            <h3 className="subsection-title">Payment</h3>
            <div className="summary-row">
              <span className="label">Method</span>
              <span className="value">{paymentMethod}</span>
            </div>
            <div className="summary-row">
              <span className="label">Status</span>
              <span className="value">{paymentStatus}</span>
            </div>

            <hr className="divider-light" />

            <h3 className="subsection-title">Shipping Address</h3>
            {addressLines.length === 0 ? (
              <p className="muted">No shipping address information available.</p>
            ) : (
              <address className="shipping-address">
                {addressLines.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </address>
            )}
          </div>
        </motion.div>

        {/* Footer Actions */}
        <motion.div
          className="detail-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            type="button"
            className="btn-gold btn-secondary"
            onClick={() => navigate('/orders')}
          >
            Back to Orders
          </button>

          <button
            type="button"
            className="btn-gold"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetail;

/* ==============================
   Inline CSS (Order Detail)
   ============================== */

const ORDER_LOADING_STYLES = `
  .royal-order-detail-page.royal-loading {
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

const ORDER_DETAIL_STYLES = `
  .royal-order-detail-page {
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
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 0;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }
  .page-title {
    color: #d4af37;
    text-transform: uppercase;
    letter-spacing: 3px;
    text-align: center;
    margin-bottom: 1rem;
    font-size: 2.5rem;
    text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
  }
  .royal-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2.5rem auto;
    max-width: 260px;
  }
  .royal-divider .line {
    flex-grow: 1;
    height: 1px;
    background-color: rgba(212, 175, 55, 0.3);
  }
  .royal-divider .diamond {
    color: #d4af37;
    font-size: 1rem;
    margin: 0 12px;
    filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.8));
  }

  .detail-header {
    margin-bottom: 2rem;
  }
  .header-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.2rem;
    margin-top: 1rem;
  }
  .header-meta .label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #b3b3b3;
    margin-bottom: 0.25rem;
  }
  .header-meta .value {
    font-size: 0.95rem;
  }
  .header-meta .value.important {
    font-size: 1.1rem;
    font-weight: bold;
    color: #fcf6ba;
  }

  .status-pill {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .detail-layout {
    display: grid;
    grid-template-columns: 2fr 1.1fr;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }

  .detail-card {
    background: rgba(20, 20, 20, 0.85);
    border: 1px solid rgba(212, 175, 55, 0.3);
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.7);
    padding: 1.5rem 1.8rem;
  }
  .card-title {
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #d4af37;
    margin-bottom: 1rem;
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
  }
  .items-table th,
  .items-table td {
    padding: 10px 8px;
    border-bottom: 1px solid rgba(212, 175, 55, 0.1);
    font-size: 0.9rem;
  }
  .items-table th {
    text-align: left;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 1px;
    color: #d4af37;
    background-color: rgba(212, 175, 55, 0.07);
  }
  .items-table .item-name {
    font-weight: 600;
  }
  .items-table .item-subtotal {
    color: #fcf6ba;
    font-weight: bold;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.4rem;
    font-size: 0.9rem;
  }
  .summary-row.total-row {
    margin-top: 0.6rem;
    padding-top: 0.4rem;
    border-top: 1px solid rgba(212, 175, 55, 0.3);
  }
  .summary-row .label {
    color: #c0c0c0;
  }
  .summary-row .value.important {
    color: #fcf6ba;
    font-weight: bold;
  }

  .divider-light {
    border: none;
    border-top: 1px solid rgba(212, 175, 55, 0.2);
    margin: 0.9rem 0 0.8rem;
  }
  .subsection-title {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #d4af37;
    margin-bottom: 0.4rem;
  }
  .muted {
    font-size: 0.85rem;
    color: #aaaaaa;
  }

  .shipping-address {
    font-style: normal;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .detail-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .btn-gold {
    background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
    color: #000;
    padding: 10px 24px;
    text-decoration: none;
    font-weight: bold;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 2px;
    box-shadow: 0 4px 10px rgba(212, 175, 55, 0.3);
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
  }
  .btn-gold:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 18px rgba(212, 175, 55, 0.6);
  }
  .btn-gold.btn-secondary {
    background: transparent;
    border: 1px solid rgba(212, 175, 55, 0.6);
    color: #d4af37;
    box-shadow: none;
  }
  .btn-gold.btn-secondary:hover {
    background: rgba(212, 175, 55, 0.18);
  }

  @media (max-width: 900px) {
    .detail-layout {
      grid-template-columns: 1fr;
    }
    .detail-actions {
      flex-direction: column;
      align-items: stretch;
    }
    .detail-actions .btn-gold {
      width: 100%;
      text-align: center;
    }
  }

  @media (max-width: 768px) {
    .royal-order-detail-page {
      padding: 4rem 1rem;
    }
    .page-title {
      font-size: 2.1rem;
    }
  }
`;

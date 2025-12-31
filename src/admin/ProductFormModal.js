// src/admin/ProductFormModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const initialFormState = {
  name: '',
  slug: '',
  description: '',
  price: '',
  stock: '',
  is_active: true,
};

const ProductFormModal = ({ isOpen, onClose, initialData }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!initialData;
  const formTitle = isEditMode ? 'Modify Artifact Registry' : 'Commission New Artifact';

  // Populate form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        price: initialData.price || '',
        stock: initialData.stock || '',
        is_active:
          initialData.is_active !== undefined ? initialData.is_active : true,
      });
      setImageFile(null);
    } else {
      setFormData(initialFormState);
    }
    setError('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const data = new FormData();

    // Append all fields from formData (no category now)
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (isEditMode) {
        // UPDATE → /api/<slug>/
        await api.patch(`/${initialData.slug}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert(`Artifact ${formData.name} updated successfully!`);
      } else {
        // CREATE → /api/
        await api.post('/', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert(`Artifact ${formData.name} commissioned successfully!`);
      }
      onClose();
    } catch (err) {
      console.error('API Error:', err.response || err);
      const errorData = err.response?.data;
      let msg = 'Failed to save artifact. ';
      if (errorData) {
        msg += Object.values(errorData).flat()[0];
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content royal-form-modal"
          initial={{ y: '-100vh', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100vh', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="modal-title-admin">{formTitle}</h2>
          <hr className="modal-divider" />

          {error && <p className="form-error-msg">{error}</p>}

          <form onSubmit={handleSubmit} className="product-admin-form">
            {/* Name & Slug */}
            <div className="form-group-grid">
              <div className="form-group">
                <label>Artifact Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Slug (Unique URL Key)</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required={!isEditMode}
                  disabled={isEditMode}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label>Detailed Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            {/* Price & Stock (no category) */}
            <div className="form-group-grid">
              <div className="form-group">
                <label>Valuation (Price ₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Inventory (Stock)</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                />
              </div>
            </div>

            {/* Image + Active */}
            <div className="form-group-grid">
              <div className="form-group">
                <label>{isEditMode ? 'Replace Image' : 'Artifact Image'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!isEditMode}
                />
                {isEditMode && initialData?.image && !imageFile && (
                  <p className="current-image-preview">
                    Current:{' '}
                    <a
                      href={initialData.image}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Image
                    </a>
                  </p>
                )}
              </div>
              <div
                className="form-group"
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  style={{ width: 'auto', marginRight: '10px' }}
                />
                <label htmlFor="is_active" style={{ margin: 0 }}>
                  Artifact is Live (Active)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel-admin"
                onClick={onClose}
                disabled={isLoading}
              >
                Abandon Protocol
              </button>
              <button
                type="submit"
                className="btn-gold-solid"
                disabled={isLoading}
              >
                {isLoading
                  ? 'Transmitting Data...'
                  : isEditMode
                  ? 'Execute Modification'
                  : 'Execute Commission'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      <style>{MODAL_STYLES}</style>
    </AnimatePresence>
  );
};

export default ProductFormModal;

// CSS unchanged except grid works fine with 2 columns as well
const MODAL_STYLES = `
  .modal-backdrop {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.85); z-index: 1000;
    display: flex; align-items: center; justify-content: center;
  }
  .royal-form-modal {
    background: #1a1a1a; padding: 3rem; border: 2px solid #d4af37;
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.5); max-width: 900px;
    width: 90%; max-height: 90vh; overflow-y: auto; position: relative;
    font-family: 'Cinzel', serif;
  }
  .modal-title-admin { color: #fcf6ba; text-align: center; margin-bottom: 1rem; }
  .modal-divider { border: 0; height: 1px; background: rgba(212, 175, 55, 0.3); margin-bottom: 2rem; }
  .form-error-msg { color: #ff6666; text-align: center; margin-bottom: 1rem; padding: 10px; border: 1px solid #ff6666; }
  .product-admin-form { display: flex; flex-direction: column; gap: 1rem; }
  .form-group { display: flex; flex-direction: column; }
  .form-group-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
  .form-group.full-width { grid-column: 1 / -1; }
  @media (max-width: 600px) { .form-group-grid { grid-template-columns: 1fr; } }
  .form-group label { color: #d4af37; font-size: 0.9rem; margin-bottom: 5px; text-transform: uppercase; }
  .product-admin-form input[type="text"],
  .product-admin-form input[type="number"],
  .product-admin-form textarea,
  .product-admin-form select {
    background: #333; border: 1px solid #555; padding: 12px;
    color: #fff; font-size: 1rem; transition: border-color 0.2s;
  }
  .product-admin-form input:focus,
  .product-admin-form textarea:focus,
  .product-admin-form select:focus {
    border-color: #fcf6ba; outline: none;
  }
  .product-admin-form textarea { resize: vertical; }
  .current-image-preview { font-size: 0.8rem; color: #888; margin-top: 5px; }
  .current-image-preview a { color: #d4af37; }
  .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
  .btn-gold-solid {
    background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728);
    color: #000; padding: 12px 30px; text-decoration: none; font-weight: bold;
    text-transform: uppercase; border: none; cursor: pointer; transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(212, 175, 55, 0.3);
    font-family: 'Cinzel', serif;
  }
  .btn-gold-solid:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(212, 175, 55, 0.6); }
  .btn-gold-solid:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-cancel-admin {
    background: #444; color: #fff; border: 1px solid #777;
    padding: 12px 30px; font-weight: bold; cursor: pointer;
    transition: background 0.2s; font-family: 'Cinzel', serif;
  }
  .btn-cancel-admin:hover:not(:disabled) { background: #555; }
`;

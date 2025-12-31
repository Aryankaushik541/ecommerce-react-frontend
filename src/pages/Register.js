import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.password2) {
      setError('passwords must align perfectly.');
      return;
    }

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="royal-auth-page">
      <div className="royal-bg-overlay"></div>
      
      <div className="container">
        <motion.div
          className="royal-auth-card extended-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="royal-header">
            <span className="crown-icon">⚜️</span>
            <h2>Begin Your Legacy</h2>
            <div className="mini-divider">
              <span className="line"></span>
              <span className="diamond">♦</span>
              <span className="line"></span>
            </div>
            <p className="auth-subtitle">Join the elite circle of premium shoppers.</p>
          </div>
          
          {error && (
            <motion.div className="royal-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              ⚠️ {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div className="royal-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              💎 Membership approved. Redirecting...
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="royal-form">
            
            {/* Name Row */}
            <div className="royal-form-row">
              <div className="royal-input-group">
                <input
                  type="text"
                  placeholder=" "
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  className="royal-input"
                />
                <label className="royal-label">First Name</label>
              </div>
              
              <div className="royal-input-group">
                <input
                  type="text"
                  placeholder=" "
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  className="royal-input"
                />
                <label className="royal-label">Last Name</label>
              </div>
            </div>
            
            <div className="royal-input-group">
              <input
                type="text"
                placeholder=" "
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="royal-input"
              />
              <label className="royal-label">Chosen Username</label>
            </div>
            
            <div className="royal-input-group">
              <input
                type="email"
                placeholder=" "
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="royal-input"
              />
              <label className="royal-label">Email Address</label>
            </div>
            
            <div className="royal-input-group">
              <input
                type="password"
                placeholder=" "
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength="8"
                className="royal-input"
              />
              <label className="royal-label">Password</label>
            </div>
            
            <div className="royal-input-group">
              <input
                type="password"
                placeholder=" "
                value={formData.password2}
                onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                required
                minLength="8"
                className="royal-input"
              />
              <label className="royal-label">Confirm Password</label>
            </div>
            
            <button type="submit" className="btn-gold full-width">
              Claim Your Membership
            </button>
          </form>
          
          <div className="royal-footer">
            <p>
              Already a member? <Link to="/login" className="gold-link">Enter Vault</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
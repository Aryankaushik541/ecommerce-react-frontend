import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      setError('Credentials not recognized.');
    }
  };

  return (
    <div className="royal-auth-page">
      <div className="royal-bg-overlay"></div>
      
      <div className="container">
        <motion.div
          className="royal-auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="royal-header">
            <span className="crown-icon">♔</span>
            <h2>Welcome Back</h2>
            <div className="mini-divider">
              <span className="line"></span>
              <span className="diamond">♦</span>
              <span className="line"></span>
            </div>
            <p className="auth-subtitle">Enter your credentials to access the domain.</p>
          </div>
          
          {error && (
            <motion.div 
              className="royal-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ⚠️ {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="royal-form">
            <div className="royal-input-group">
              <input
                type="text"
                placeholder=" "
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="royal-input"
              />
              <label className="royal-label">Username</label>
            </div>
            
            <div className="royal-input-group">
              <input
                type="password"
                placeholder=" "
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="royal-input"
              />
              <label className="royal-label">Password</label>
            </div>
            
            <button type="submit" className="btn-gold full-width">
              Access Account
            </button>
          </form>
          
          <div className="royal-footer">
            <p>
              Not yet a member? <Link to="/register" className="gold-link">Apply for Access</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
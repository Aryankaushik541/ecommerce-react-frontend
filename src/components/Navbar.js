import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar glass-effect">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h2>🛍️ EcomStore</h2>
        </Link>
        
        <ul className="nav-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/cart">Cart</Link></li>
          
          {user ? (
            <>
              {user.is_staff && (
                <li><Link to="/admin">Admin</Link></li>
              )}
              <li><span className="user-name">Hi, {user.username}</span></li>
              <li><button onClick={logout} className="btn-secondary">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn-primary">Login</Link></li>
              <li><Link to="/register" className="btn-secondary">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

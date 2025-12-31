import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../pages/ProductDetail.css'; // Importing CSS for the spinner

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // This shows the Golden Spinner we created in ProductDetail.css
    return (
      <div className="royal-loading">
        <div className="spinner-gold"></div>
      </div>
    );
  }

  // If not logged in, redirect to Login
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
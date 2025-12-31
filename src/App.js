// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import AnimatedBackground from './components/AnimatedBackground';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminOrderDetail from './admin/AdminOrderDetail';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AnimatedBackground />
          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected User Routes */}
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />

            {/* User Orders List */}
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />

            {/* User Order Detail */}
            <Route
              path="/orders/:orderId"
              element={
                <PrivateRoute>
                  <OrderDetail />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <PrivateRoute>
                  <AdminProducts />
                </PrivateRoute>
              }
            />

            {/* Admin Orders List */}
            <Route
              path="/admin/orders"
              element={
                <PrivateRoute>
                  <AdminOrders />
                </PrivateRoute>
              }
            />

            {/* Admin Order Detail */}
            <Route
              path="/admin/orders/:orderId"
              element={
                <PrivateRoute>
                  <AdminOrderDetail />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

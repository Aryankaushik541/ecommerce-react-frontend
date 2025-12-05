import React from 'react';
import './Cart.css';

const Cart = () => {
  return (
    <div className="cart-page page-content">
      <div className="container">
        <h1 className="page-title">Shopping Cart</h1>
        <div className="cart-empty glass-effect">
          <p>Your cart is empty</p>
          <p className="cart-subtitle">Add some products to get started!</p>
        </div>
      </div>
    </div>
  );
};

export default Cart;

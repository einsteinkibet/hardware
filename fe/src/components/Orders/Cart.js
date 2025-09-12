// src/components/Orders/Cart.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { productAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, clearCart, loading } = useCart();
  const [products, setProducts] = useState({});

  useEffect(() => {
    if (cart && cart.items) {
      fetchProductDetails();
    }
  }, [cart]);

  const fetchProductDetails = async () => {
    try {
      const productDetails = {};
      for (const item of cart.items) {
        const response = await productAPI.getById(item.product);
        productDetails[item.product] = response.data;
      }
      setProducts(productDetails);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const getTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  if (loading) {
    return <LoadingSpinner text="Loading cart..." />;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
        <h3>Your cart is empty</h3>
        <p className="text-muted">Add some products to get started</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Shopping Cart</h1>
        <button className="btn btn-outline-danger" onClick={clearCart}>
          <i className="fas fa-trash me-2"></i>Clear Cart
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          {cart.items.map(item => (
            <div key={item.id} className="row align-items-center mb-3 pb-3 border-bottom">
              <div className="col-md-2">
                {products[item.product]?.images?.[0] && (
                  <img
                    src={products[item.product].images[0].image}
                    alt={products[item.product]?.name}
                    className="img-fluid rounded"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                )}
              </div>
              <div className="col-md-4">
                <h6 className="mb-1">{products[item.product]?.name || 'Loading...'}</h6>
                <small className="text-muted">SKU: {products[item.product]?.sku}</small>
              </div>
              <div className="col-md-2">
                <span className="fw-bold">${item.price}</span>
              </div>
              <div className="col-md-2">
                <div className="input-group input-group-sm">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="form-control text-center"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    min="1"
                  />
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="col-md-2 text-end">
                <span className="fw-bold">${(item.price * item.quantity).toFixed(2)}</span>
                <button
                  className="btn btn-link text-danger ms-2"
                  onClick={() => removeFromCart(item.id)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h5>Order Summary</h5>
              <div className="d-flex justify-content-between">
                <span>Subtotal:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Tax:</span>
                <span>$0.00</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Discount:</span>
                <span>$0.00</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>
            <div className="col-md-6 text-end">
              <button className="btn btn-primary btn-lg">
                <i className="fas fa-credit-card me-2"></i>Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
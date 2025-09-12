// src/components/Orders/Checkout.js
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { orderAPI } from '../../services/api';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orderAPI.create({
        customer_info: customerInfo,
        payment_method: paymentMethod,
        items: cart.items
      });
      await clearCart();
      // Redirect to order confirmation
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="row">
      <div className="col-md-8">
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="card-title mb-0">Customer Information</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Phone *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Address *</label>
                    <textarea
                      className="form-control"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Payment Method *</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit Card</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Processing...' : 'Complete Order'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Order Summary</h5>
          </div>
          <div className="card-body">
            {cart?.items?.map(item => (
              <div key={item.id} className="d-flex justify-content-between mb-2">
                <span>{item.quantity} x Product</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total:</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
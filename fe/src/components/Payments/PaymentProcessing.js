// src/components/Payments/PaymentProcessing.js
import React, { useState, useEffect } from 'react';
import { orderAPI, paymentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const PaymentProcessing = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'cash',
    reference: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll({ payment_status: 'pending,partial' });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setLoading(true);
    try {
      await paymentAPI.process({
        order_id: selectedOrder.id,
        ...paymentData,
        amount: parseFloat(paymentData.amount)
      });
      toast.success('Payment processed successfully');
      setSelectedOrder(null);
      setPaymentData({ amount: '', method: 'cash', reference: '' });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const amountDue = selectedOrder ? selectedOrder.total - selectedOrder.amount_paid : 0;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Process Payments</h1>
      </div>

      <div className="row">
        {/* Orders List */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Orders Pending Payment</h5>
            </div>
            <div className="card-body">
              <div className="list-group">
                {orders.map(order => (
                  <button
                    key={order.id}
                    className={`list-group-item list-group-item-action ${
                      selectedOrder?.id === order.id ? 'active' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Order #{order.order_number}</strong>
                        <br />
                        <small>
                          {order.customer.user.first_name} {order.customer.user.last_name}
                        </small>
                      </div>
                      <div className="text-end">
                        <div>Total: ${order.total}</div>
                        <div>Paid: ${order.amount_paid}</div>
                        <div className="text-danger">Due: ${order.total - order.amount_paid}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {orders.length === 0 && (
                <div className="text-center py-4">
                  <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                  <p className="text-muted">No orders pending payment</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="col-md-6">
          {selectedOrder ? (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  Process Payment - Order #{selectedOrder.order_number}
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Customer</label>
                  <input
                    type="text"
                    className="form-control"
                    value={`${selectedOrder.customer.user.first_name} ${selectedOrder.customer.user.last_name}`}
                    disabled
                  />
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Total Amount</label>
                    <input
                      type="text"
                      className="form-control"
                      value={`$${selectedOrder.total}`}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Amount Due</label>
                    <input
                      type="text"
                      className="form-control"
                      value={`$${amountDue.toFixed(2)}`}
                      disabled
                    />
                  </div>
                </div>

                <form onSubmit={handlePayment}>
                  <div className="mb-3">
                    <label className="form-label">Payment Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      max={amountDue}
                      className="form-control"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Payment Method *</label>
                    <select
                      className="form-select"
                      value={paymentData.method}
                      onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Credit Card</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="credit">Store Credit</option>
                      <option value="mpesa">M-Pesa</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Reference Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={paymentData.reference}
                      onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                      placeholder="Transaction ID, check number, etc."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={loading || !paymentData.amount || parseFloat(paymentData.amount) <= 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing...
                      </>
                    ) : (
                      'Process Payment'
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center">
                <i className="fas fa-credit-card fa-3x text-muted mb-3"></i>
                <p className="text-muted">Select an order to process payment</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessing;
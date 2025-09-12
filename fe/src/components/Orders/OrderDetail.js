// src/components/Orders/OrderDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../utils/constants';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getById(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      await orderAPI.updateStatus(id, newStatus);
      fetchOrder(); // Refresh order data
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading order details..." />;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Order #{order.order_number}</h1>
          <p className="text-muted">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="btn-group">
          <button className="btn btn-outline-primary">
            <i className="fas fa-print me-2"></i>Print Receipt
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Order Items</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.product.name}</td>
                        <td>${item.price}</td>
                        <td>{item.quantity}</td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${order.subtotal}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>${order.tax}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Discount:</span>
                <span>${order.discount}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>${order.total}</span>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Order Status</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Current Status</label>
                <div className={`badge ${
                  order.status === ORDER_STATUS.PENDING ? 'bg-warning' :
                  order.status === ORDER_STATUS.CONFIRMED ? 'bg-info' :
                  order.status === ORDER_STATUS.PROCESSING ? 'bg-primary' :
                  order.status === ORDER_STATUS.SHIPPED ? 'bg-success' :
                  order.status === ORDER_STATUS.DELIVERED ? 'bg-success' :
                  order.status === ORDER_STATUS.CANCELLED ? 'bg-danger' : 'bg-secondary'
                }`}>
                  {order.status}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Payment Status</label>
                <div className={`badge ${
                  order.payment_status === PAYMENT_STATUS.PENDING ? 'bg-warning' :
                  order.payment_status === PAYMENT_STATUS.PARTIAL ? 'bg-info' :
                  order.payment_status === PAYMENT_STATUS.PAID ? 'bg-success' :
                  order.payment_status === PAYMENT_STATUS.REFUNDED ? 'bg-secondary' : 'bg-secondary'
                }`}>
                  {order.payment_status}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Update Status</label>
                <select
                  className="form-select"
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                >
                  {Object.values(ORDER_STATUS).map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Customer Information</h5>
            </div>
            <div className="card-body">
              <p className="mb-1">
                <strong>Name:</strong> {order.customer.user.first_name} {order.customer.user.last_name}
              </p>
              <p className="mb-1">
                <strong>Email:</strong> {order.customer.user.email}
              </p>
              <p className="mb-1">
                <strong>Phone:</strong> {order.customer.phone || 'N/A'}
              </p>
              <p className="mb-0">
                <strong>Address:</strong> {order.customer.address || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
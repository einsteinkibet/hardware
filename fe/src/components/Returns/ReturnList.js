// src/components/Returns/ReturnList.js
import React, { useState, useEffect } from 'react';
import { returnAPI, orderAPI, productAPI } from '../../services/api';

const ReturnList = () => {
  const [returns, setReturns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    order: '',
    product: '',
    quantity: 1,
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [returnsResponse, ordersResponse, productsResponse] = await Promise.all([
        returnAPI.getAll(),
        orderAPI.getAll({ status: 'delivered' }),
        productAPI.getAll()
      ]);
      setReturns(returnsResponse.data);
      setOrders(ordersResponse.data.results || ordersResponse.data);
      setProducts(productsResponse.data.results || productsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await returnAPI.create(formData);
      setShowForm(false);
      setFormData({ order: '', product: '', quantity: 1, reason: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to create return:', error);
    }
  };

  const processReturn = async (returnId, status, refundAmount = null) => {
    try {
      await returnAPI.process(returnId, { status, refund_amount: refundAmount });
      fetchData();
    } catch (error) {
      console.error('Failed to process return:', error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Returns & Refunds</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-undo me-2"></i>Create Return
        </button>
      </div>

      {/* Returns Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Order</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Refund Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map(returnItem => (
                  <tr key={returnItem.id}>
                    <td>#{returnItem.id}</td>
                    <td>Order #{returnItem.order?.order_number}</td>
                    <td>{returnItem.product?.name}</td>
                    <td>{returnItem.quantity}</td>
                    <td>
                      <span className="badge bg-secondary">{returnItem.reason}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        returnItem.status === 'approved' ? 'bg-success' :
                        returnItem.status === 'rejected' ? 'bg-danger' :
                        returnItem.status === 'processed' ? 'bg-info' : 'bg-warning'
                      }`}>
                        {returnItem.status}
                      </span>
                    </td>
                    <td>
                      {returnItem.refund_amount ? `$${returnItem.refund_amount}` : 'N/A'}
                    </td>
                    <td>
                      {returnItem.status === 'pending' && (
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => processReturn(returnItem.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => processReturn(returnItem.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {returnItem.status === 'approved' && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            const refundAmount = prompt('Enter refund amount:');
                            if (refundAmount) {
                              processReturn(returnItem.id, 'processed', parseFloat(refundAmount));
                            }
                          }}
                        >
                          Process Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Return Modal */}
      {showForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Return Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Order *</label>
                    <select
                      className="form-select"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                      required
                    >
                      <option value="">Select Order</option>
                      {orders.map(order => (
                        <option key={order.id} value={order.id}>
                          Order #{order.order_number} - {order.customer?.user?.first_name} {order.customer?.user?.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Product *</label>
                    <select
                      className="form-select"
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reason *</label>
                    <select
                      className="form-select"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                    >
                      <option value="">Select Reason</option>
                      <option value="defective">Defective Product</option>
                      <option value="wrong_item">Wrong Item Received</option>
                      <option value="customer_change_mind">Customer Changed Mind</option>
                      <option value="damaged">Damaged in Transit</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Create Return</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnList;
// src/components/Payments/PaymentList.js
import React, { useState, useEffect } from 'react';
import { paymentAPI, orderAPI } from '../../services/api';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    method: '',
    start_date: '',
    end_date: '',
    order_number: ''
  });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      const params = {};
      if (filters.method) params.method = filters.method;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.order_number) params.order_number = filters.order_number;

      const response = await paymentAPI.getAll(params);
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodBadge = (method) => {
    const methodColors = {
      cash: 'success',
      card: 'primary',
      bank: 'info',
      credit: 'warning',
      mpesa: 'dark'
    };
    return `bg-${methodColors[method]}`;
  };

  const formatMethod = (method) => {
    const methodNames = {
      cash: 'Cash',
      card: 'Credit Card',
      bank: 'Bank Transfer',
      credit: 'Store Credit',
      mpesa: 'M-Pesa'
    };
    return methodNames[method] || method;
  };

  const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Payments</h1>
        <div className="btn-group">
          <button className="btn btn-outline-primary" onClick={fetchPayments}>
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={filters.method}
                onChange={(e) => setFilters({ ...filters, method: e.target.value })}
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Credit Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="credit">Store Credit</option>
                <option value="mpesa">M-Pesa</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Order Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Order #"
                value={filters.order_number}
                onChange={(e) => setFilters({ ...filters, order_number: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Payments</h5>
              <h2 className="card-text">${totalAmount.toFixed(2)}</h2>
              <p className="card-text">{payments.length} transactions</p>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Payment Methods Summary</h6>
              <div className="row">
                {Object.entries(
                  payments.reduce((acc, payment) => {
                    acc[payment.method] = (acc[payment.method] || 0) + parseFloat(payment.amount);
                    return acc;
                  }, {})
                ).map(([method, amount]) => (
                  <div key={method} className="col-md-4 mb-2">
                    <span className={`badge ${getMethodBadge(method)} me-2`}>
                      {formatMethod(method)}
                    </span>
                    <span>${amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Processed By</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.created_at).toLocaleString()}</td>
                    <td>
                      <span className="badge bg-secondary">
                        #{payment.order.order_number}
                      </span>
                    </td>
                    <td>
                      {payment.order.customer.user.first_name}{' '}
                      {payment.order.customer.user.last_name}
                    </td>
                    <td>
                      <strong>${parseFloat(payment.amount).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${getMethodBadge(payment.method)}`}>
                        {formatMethod(payment.method)}
                      </span>
                    </td>
                    <td>{payment.reference || 'N/A'}</td>
                    <td>{payment.processed_by?.username || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payments.length === 0 && !loading && (
            <div className="text-center py-4">
              <i className="fas fa-credit-card fa-3x text-muted mb-3"></i>
              <p className="text-muted">No payments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentList;
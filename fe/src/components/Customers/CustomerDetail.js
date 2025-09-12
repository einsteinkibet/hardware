// src/components/Customers/CustomerDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { customerAPI, orderAPI, balanceTransactionAPI, debtAPI } from '../../services/api';

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [customerResponse, ordersResponse, transactionsResponse, debtsResponse] = await Promise.all([
        customerAPI.getById(id),
        customerAPI.getOrders(id),
        customerAPI.getTransactions(id),
        customerAPI.getDebts(id)
      ]);
      
      setCustomer(customerResponse.data);
      setOrders(ordersResponse.data);
      setTransactions(transactionsResponse.data);
      setDebts(debtsResponse.data);
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">
            {customer.user.first_name} {customer.user.last_name}
          </h1>
          <p className="text-muted mb-0">{customer.user.email} | {customer.phone}</p>
        </div>
      </div>

      {/* Customer Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Balance</h5>
              <h2 className="card-text">${parseFloat(customer.balance).toFixed(2)}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Credit Limit</h5>
              <h2 className="card-text">${parseFloat(customer.credit_limit).toFixed(2)}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Available Credit</h5>
              <h2 className="card-text">${parseFloat(customer.available_credit).toFixed(2)}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Total Orders</h5>
              <h2 className="card-text">{orders.length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions ({transactions.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'debts' ? 'active' : ''}`}
            onClick={() => setActiveTab('debts')}
          >
            Debts ({debts.filter(d => !d.is_settled).length})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Customer Information</h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Name:</div>
                    <div className="col-sm-8">
                      {customer.user.first_name} {customer.user.last_name}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Email:</div>
                    <div className="col-sm-8">{customer.user.email}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Phone:</div>
                    <div className="col-sm-8">{customer.phone || 'Not provided'}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Address:</div>
                    <div className="col-sm-8">{customer.address || 'Not provided'}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Status:</div>
                    <div className="col-sm-8">
                      <span className={`badge ${customer.is_approved ? 'bg-success' : 'bg-warning'}`}>
                        {customer.is_approved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Financial Summary</h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-sm-6 fw-bold">Current Balance:</div>
                    <div className="col-sm-6">
                      <span className={`badge ${customer.balance < 0 ? 'bg-danger' : 'bg-success'}`}>
                        ${parseFloat(customer.balance).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-6 fw-bold">Credit Limit:</div>
                    <div className="col-sm-6">${parseFloat(customer.credit_limit).toFixed(2)}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-6 fw-bold">Available Credit:</div>
                    <div className="col-sm-6">
                      <span className="badge bg-info">
                        ${parseFloat(customer.available_credit).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-6 fw-bold">Total Orders:</div>
                    <div className="col-sm-6">{orders.length}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-6 fw-bold">Outstanding Debts:</div>
                    <div className="col-sm-6">
                      {debts.filter(d => !d.is_settled).length} debts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Balance Transactions</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Old Balance</th>
                      <th>New Balance</th>
                      <th>Description</th>
                      <th>Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td>{new Date(transaction.created_at).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${
                            transaction.transaction_type === 'payment' ? 'bg-success' :
                            transaction.transaction_type === 'purchase' ? 'bg-danger' :
                            transaction.transaction_type === 'refund' ? 'bg-info' : 'bg-warning'
                          }`}>
                            {transaction.transaction_type}
                          </span>
                        </td>
                        <td>
                          <span className={`${transaction.amount > 0 ? 'text-success' : 'text-danger'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </span>
                        </td>
                        <td>${parseFloat(transaction.old_balance).toFixed(2)}</td>
                        <td>${parseFloat(transaction.new_balance).toFixed(2)}</td>
                        <td>{transaction.description}</td>
                        <td>
                          {transaction.order ? (
                            <span className="badge bg-primary">#{transaction.order.order_number}</span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
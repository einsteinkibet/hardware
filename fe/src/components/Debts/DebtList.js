// src/components/Debts/DebtList.js
import React, { useState, useEffect } from 'react';
import { debtAPI, customerAPI } from '../../services/api';

const DebtList = () => {
  const [debts, setDebts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [debtsResponse, customersResponse] = await Promise.all([
        debtAPI.getAll(),
        customerAPI.getAll()
      ]);
      setDebts(debtsResponse.data);
      setCustomers(customersResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (debtId) => {
    try {
      await debtAPI.createPayment(debtId, {
        amount: parseFloat(paymentAmount),
        method: 'cash',
        reference: `Payment for debt ${debtId}`
      });
      setSelectedDebt(null);
      setPaymentAmount('');
      fetchData();
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const sendReminder = async (debtId) => {
    try {
      await debtAPI.sendReminder(debtId);
      alert('Reminder sent successfully');
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  };

  const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.remaining_amount), 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Customer Debts</h1>
      </div>

      {/* Summary Card */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Total Outstanding Debt</h5>
              <h2 className="card-text">${totalDebt.toFixed(2)}</h2>
              <p className="card-text">{debts.filter(d => !d.is_settled).length} active debts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Debts Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order #</th>
                  <th>Initial Amount</th>
                  <th>Remaining</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {debts.map(debt => (
                  <tr key={debt.id} className={debt.is_settled ? 'table-success' : ''}>
                    <td>{debt.customer.user?.get_full_name || debt.customer.user?.username}</td>
                    <td>{debt.order.order_number}</td>
                    <td>${parseFloat(debt.initial_amount).toFixed(2)}</td>
                    <td>
                      <strong>${parseFloat(debt.remaining_amount).toFixed(2)}</strong>
                    </td>
                    <td>
                      {new Date(debt.due_date).toLocaleDateString()}
                      {new Date(debt.due_date) < new Date() && !debt.is_settled && (
                        <span className="badge bg-danger ms-2">Overdue</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${debt.is_settled ? 'bg-success' : 'bg-warning'}`}>
                        {debt.is_settled ? 'Settled' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!debt.is_settled && (
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setSelectedDebt(debt)}
                          >
                            <i className="fas fa-money-bill me-1"></i>Pay
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => sendReminder(debt.id)}
                          >
                            <i className="fas fa-bell me-1"></i>Remind
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedDebt && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Process Payment</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedDebt(null)}></button>
              </div>
              <div className="modal-body">
                <p>
                  Customer: <strong>{selectedDebt.customer.user?.get_full_name}</strong><br />
                  Debt Amount: <strong>${parseFloat(selectedDebt.remaining_amount).toFixed(2)}</strong><br />
                  Order: <strong>#{selectedDebt.order.order_number}</strong>
                </p>
                <div className="mb-3">
                  <label className="form-label">Payment Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    max={selectedDebt.remaining_amount}
                    className="form-control"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedDebt(null)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => handlePayment(selectedDebt.id)}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                >
                  Process Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtList;
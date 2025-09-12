// src/components/Debts/DebtManagement.js
import React, { useState, useEffect } from 'react';
import { debtAPI, customerAPI } from '../../services/api';
import { toast } from 'react-toastify';

const DebtManagement = () => {
  const [debts, setDebts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [loading, setLoading] = useState(true);

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

  const sendReminder = async (debtId) => {
    try {
      await debtAPI.sendReminder(debtId);
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  const sendReminderToAll = async () => {
    try {
      const overdueDebts = debts.filter(debt => 
        !debt.is_settled && new Date(debt.due_date) < new Date()
      );
      
      for (const debt of overdueDebts) {
        await debtAPI.sendReminder(debt.id);
      }
      
      toast.success(`Reminders sent to ${overdueDebts.length} customers`);
    } catch (error) {
      toast.error('Failed to send reminders');
    }
  };

  const filteredDebts = selectedCustomer
    ? debts.filter(debt => debt.customer.id === parseInt(selectedCustomer))
    : debts;

  const totalOutstanding = filteredDebts
    .filter(debt => !debt.is_settled)
    .reduce((sum, debt) => sum + parseFloat(debt.remaining_amount), 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Debt Management</h1>
        <button className="btn btn-warning" onClick={sendReminderToAll}>
          <i className="fas fa-bell me-2"></i>Send Reminders to All Overdue
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Filter by Customer</label>
              <select
                className="form-select"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.user.first_name} {customer.user.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-end h-100">
                <span className="text-muted">
                  {filteredDebts.filter(d => !d.is_settled).length} active debts • 
                  Total Outstanding: <strong>${totalOutstanding.toFixed(2)}</strong>
                </span>
              </div>
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
                {filteredDebts.map(debt => (
                  <tr key={debt.id} className={debt.is_settled ? 'table-success' : ''}>
                    <td>
                      {debt.customer.user.first_name} {debt.customer.user.last_name}
                      <br />
                      <small className="text-muted">{debt.customer.user.email}</small>
                    </td>
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
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => sendReminder(debt.id)}
                          title="Send reminder"
                        >
                          <i className="fas fa-bell"></i>
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
    </div>
  );
};

export default DebtManagement;
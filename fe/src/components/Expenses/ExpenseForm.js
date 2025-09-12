// src/components/Expenses/ExpenseForm.js
import React, { useState } from 'react';
import { expenseAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ExpenseForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await expenseAPI.create(formData);
      toast.success('Expense added successfully');
      onSave();
      setFormData({ category: '', amount: '', description: '' });
    } catch (error) {
      toast.error('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Add New Expense</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="d-flex gap-2">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Adding...
                </>
              ) : (
                'Add Expense'
              )}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
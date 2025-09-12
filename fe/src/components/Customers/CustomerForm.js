// src/components/Customers/CustomerForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import { toast } from 'react-toastify';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    credit_limit: '1000',
    is_approved: true
  });

  useEffect(() => {
    if (isEdit) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await customerAPI.getById(id);
      const customer = response.data;
      setFormData({
        username: customer.user.username,
        email: customer.user.email,
        first_name: customer.user.first_name,
        last_name: customer.user.last_name,
        phone: customer.phone,
        address: customer.address,
        credit_limit: customer.credit_limit,
        is_approved: customer.is_approved
      });
    } catch (error) {
      toast.error('Failed to fetch customer data');
      navigate('/customers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await customerAPI.update(id, formData);
        toast.success('Customer updated successfully');
      } else {
        await customerAPI.create(formData);
        toast.success('Customer created successfully');
      }
      navigate('/customers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          {isEdit ? 'Edit Customer' : 'Create New Customer'}
        </h1>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/customers')}
        >
          Cancel
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={loading || isEdit}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Credit Limit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Address</label>
              <textarea
                className="form-control"
                rows="3"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={formData.is_approved}
                  onChange={(e) => setFormData({ ...formData, is_approved: e.target.checked })}
                  disabled={loading}
                />
                <label className="form-check-label">
                  Approved for credit purchases
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update Customer' : 'Create Customer'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
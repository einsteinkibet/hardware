// src/components/Customers/CustomerList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerAPI } from '../../services/api';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll({ search: searchTerm });
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Add debounce here in production
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Customers</h1>
        <Link to="/customers/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>Add Customer
        </Link>
      </div>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="btn btn-primary" onClick={fetchCustomers}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Balance</th>
                  <th>Credit Limit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <strong>
                        {customer.user.first_name} {customer.user.last_name}
                      </strong>
                    </td>
                    <td>{customer.user.email}</td>
                    <td>{customer.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${customer.balance < 0 ? 'bg-danger' : 'bg-success'}`}>
                        ${parseFloat(customer.balance).toFixed(2)}
                      </span>
                    </td>
                    <td>${parseFloat(customer.credit_limit).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${customer.is_approved ? 'bg-success' : 'bg-warning'}`}>
                        {customer.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <Link
                          to={`/customers/${customer.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        <button className="btn btn-sm btn-outline-secondary">
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {customers.length === 0 && !loading && (
            <div className="text-center py-4">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <p className="text-muted">No customers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
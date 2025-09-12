// src/components/Taxes/TaxManager.js
import React, { useState, useEffect } from 'react';
import { taxRateAPI, categoryAPI } from '../../services/api';

const TaxManager = () => {
  const [taxRates, setTaxRates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    is_active: true,
    country: '',
    state: '',
    applicable_categories: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [taxResponse, categoriesResponse] = await Promise.all([
        taxRateAPI.getAll(),
        categoryAPI.getAll()
      ]);
      setTaxRates(taxResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taxRateAPI.create({
        ...formData,
        rate: parseFloat(formData.rate) / 100 // Convert percentage to decimal
      });
      setShowForm(false);
      setFormData({ name: '', rate: '', is_active: true, country: '', state: '', applicable_categories: [] });
      fetchData();
    } catch (error) {
      console.error('Failed to create tax rate:', error);
    }
  };

  const toggleCategorySelection = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      applicable_categories: prev.applicable_categories.includes(categoryId)
        ? prev.applicable_categories.filter(id => id !== categoryId)
        : [...prev.applicable_categories, categoryId]
    }));
  };

  const toggleTaxStatus = async (taxId, currentStatus) => {
    try {
      await taxRateAPI.update(taxId, { is_active: !currentStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update tax status:', error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Tax Rate Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus me-2"></i>Add Tax Rate
        </button>
      </div>

      {/* Tax Rates Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rate</th>
                  <th>Country/State</th>
                  <th>Applicable Categories</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {taxRates.map(tax => (
                  <tr key={tax.id}>
                    <td>{tax.name}</td>
                    <td>{(tax.rate * 100).toFixed(2)}%</td>
                    <td>
                      {tax.country && (
                        <span className="badge bg-info me-1">{tax.country}</span>
                      )}
                      {tax.state && (
                        <span className="badge bg-secondary">{tax.state}</span>
                      )}
                    </td>
                    <td>
                      {tax.applicable_categories.slice(0, 3).map(cat => (
                        <span key={cat.id} className="badge bg-light text-dark me-1">
                          {cat.name}
                        </span>
                      ))}
                      {tax.applicable_categories.length > 3 && (
                        <span className="badge bg-light text-dark">
                          +{tax.applicable_categories.length - 3}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${tax.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {tax.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => toggleTaxStatus(tax.id, tax.is_active)}
                        >
                          {tax.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Tax Rate Modal */}
      {showForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Tax Rate</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tax Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tax Rate (%) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          className="form-control"
                          value={formData.rate}
                          onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Country Code (ISO)</label>
                        <input
                          type="text"
                          maxLength="2"
                          className="form-control"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                          placeholder="US, CA, etc."
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">State/Province</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Applicable Categories</label>
                    <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {categories.map(category => (
                        <div key={category.id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.applicable_categories.includes(category.id)}
                            onChange={() => toggleCategorySelection(category.id)}
                          />
                          <label className="form-check-label">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <label className="form-check-label">
                      Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Create Tax Rate</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxManager;
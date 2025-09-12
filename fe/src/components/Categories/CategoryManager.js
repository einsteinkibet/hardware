// src/components/Categories/CategoryManager.js
import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await categoryAPI.create(formData);
      setShowForm(false);
      setFormData({ name: '', description: '', parent: '', is_active: true });
      fetchCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading categories..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Category Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus me-2"></i>Add Category
        </button>
      </div>

      <div className="row">
        {categories.map(category => (
          <div key={category.id} className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{category.name}</h5>
                <p className="card-text">{category.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className={`badge ${category.is_active ? 'bg-success' : 'bg-secondary'}`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="badge bg-info">
                    {category.products_count || 0} Products
                  </span>
                </div>
                {category.parent && (
                  <small className="text-muted">
                    Parent: {category.parent.name}
                  </small>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Category</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Parent Category</label>
                    <select
                      className="form-select"
                      value={formData.parent}
                      onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                    >
                      <option value="">No Parent</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <label className="form-check-label">Active</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Create Category</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
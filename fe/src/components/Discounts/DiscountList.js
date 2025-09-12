// src/components/Discounts/DiscountList.js
import React, { useState, useEffect } from 'react';
import { discountAPI, productAPI, categoryAPI } from '../../services/api';

const DiscountList = () => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    value: '',
    min_order_amount: '',
    max_discount: '',
    start_date: '',
    end_date: '',
    is_active: true,
    usage_limit: '',
    products: [],
    categories: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [discountsResponse, productsResponse, categoriesResponse] = await Promise.all([
        discountAPI.getAll(),
        productAPI.getAll(),
        categoryAPI.getAll()
      ]);
      setDiscounts(discountsResponse.data);
      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await discountAPI.create(formData);
      setShowForm(false);
      setFormData({
        code: '', name: '', description: '', discount_type: 'percentage', value: '',
        min_order_amount: '', max_discount: '', start_date: '', end_date: '',
        is_active: true, usage_limit: '', products: [], categories: []
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create discount:', error);
    }
  };

  const toggleProductSelection = (productId) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId]
    }));
  };

  const toggleCategorySelection = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Discounts & Promotions</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus me-2"></i>Create Discount
        </button>
      </div>

      {/* Discounts Grid */}
      <div className="row">
        {discounts.map(discount => (
          <div key={discount.id} className="col-md-6 col-lg-4 mb-4">
            <div className={`card ${discount.is_active ? 'border-primary' : 'border-secondary'}`}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="card-title mb-0">{discount.code}</h6>
                <span className={`badge ${discount.is_active ? 'bg-success' : 'bg-secondary'}`}>
                  {discount.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="card-body">
                <h5 className="card-title">{discount.name}</h5>
                <p className="card-text">{discount.description}</p>
                <div className="mb-2">
                  <strong>Discount: </strong>
                  {discount.discount_type === 'percentage' ? (
                    <span className="text-success">{discount.value}% off</span>
                  ) : (
                    <span className="text-success">${discount.value} off</span>
                  )}
                </div>
                {discount.min_order_amount && (
                  <div className="mb-2">
                    <strong>Min Order: </strong>${discount.min_order_amount}
                  </div>
                )}
                <div className="mb-2">
                  <strong>Valid: </strong>
                  {new Date(discount.start_date).toLocaleDateString()} - {new Date(discount.end_date).toLocaleDateString()}
                </div>
                <div className="mb-2">
                  <strong>Usage: </strong>
                  {discount.times_used} of {discount.usage_limit || '∞'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Discount Modal */}
      {showForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Discount</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Code *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
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
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Discount Type *</label>
                        <select
                          className="form-select"
                          value={formData.discount_type}
                          onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Value *</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Minimum Order Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.min_order_amount}
                          onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Maximum Discount</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.max_discount}
                          onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Start Date *</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">End Date *</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Usage Limit</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Applicable Products</label>
                    <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {products.map(product => (
                        <div key={product.id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.products.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                          />
                          <label className="form-check-label">
                            {product.name}
                          </label>
                        </div>
                      ))}
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
                            checked={formData.categories.includes(category.id)}
                            onChange={() => toggleCategorySelection(category.id)}
                          />
                          <label className="form-check-label">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Create Discount</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountList;
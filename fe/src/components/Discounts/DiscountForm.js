// src/components/Discounts/DiscountForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { discountAPI, productAPI, categoryAPI } from '../../services/api';
import { toast } from 'react-toastify';

const DiscountForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
    fetchInitialData();
    if (isEdit) {
      fetchDiscount();
    }
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll()
      ]);
      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  const fetchDiscount = async () => {
    try {
      const response = await discountAPI.getById(id);
      const discount = response.data;
      setFormData({
        code: discount.code,
        name: discount.name,
        description: discount.description,
        discount_type: discount.discount_type,
        value: discount.value,
        min_order_amount: discount.min_order_amount || '',
        max_discount: discount.max_discount || '',
        start_date: discount.start_date.slice(0, 16),
        end_date: discount.end_date.slice(0, 16),
        is_active: discount.is_active,
        usage_limit: discount.usage_limit || '',
        products: discount.products.map(p => p.id),
        categories: discount.categories.map(c => c.id)
      });
    } catch (error) {
      toast.error('Failed to fetch discount data');
      navigate('/discounts');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await discountAPI.update(id, formData);
        toast.success('Discount updated successfully');
      } else {
        await discountAPI.create(formData);
        toast.success('Discount created successfully');
      }
      navigate('/discounts');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
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
        <h1 className="h3 mb-0">
          {isEdit ? 'Edit Discount' : 'Create New Discount'}
        </h1>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/discounts')}
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
                  <label className="form-label">Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    disabled={loading || isEdit}
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
                    disabled={loading}
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
                disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Usage Limit</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      disabled={loading}
                    />
                    <label className="form-check-label">
                      Active
                    </label>
                  </div>
                </div>
              </div>
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
                      disabled={loading}
                    />
                    <label className="form-check-label">
                      {product.name} (${product.price})
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Applicable Categories</label>
              <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {categories.map(category => (
                  <div key={category.id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.categories.includes(category.id)}
                      onChange={() => toggleCategorySelection(category.id)}
                      disabled={loading}
                    />
                    <label className="form-check-label">
                      {category.name}
                    </label>
                  </div>
                ))}
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
                isEdit ? 'Update Discount' : 'Create Discount'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DiscountForm;
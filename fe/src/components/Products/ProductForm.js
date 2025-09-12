// src/components/Products/ProductForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI, supplierAPI, tagAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [tags, setTags] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    supplier: '',
    sku: '',
    barcode: '',
    price: '',
    cost_price: '',
    min_stock_level: '5',
    is_active: true,
    tags: []
  });

  useEffect(() => {
    fetchInitialData();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, suppliersRes, tagsRes] = await Promise.all([
        categoryAPI.getAll(),
        supplierAPI.getAll(),
        tagAPI.getAll()
      ]);
      setCategories(categoriesRes.data);
      setSuppliers(suppliersRes.data);
      setTags(tagsRes.data);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      const product = response.data;
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category?.id || '',
        supplier: product.supplier?.id || '',
        sku: product.sku,
        barcode: product.barcode || '',
        price: product.price,
        cost_price: product.cost_price,
        min_stock_level: product.min_stock_level,
        is_active: product.is_active,
        tags: product.tags.map(tag => tag.id)
      });
    } catch (error) {
      toast.error('Failed to fetch product data');
      navigate('/products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await productAPI.update(id, formData);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(formData);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleTagSelection = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          {isEdit ? 'Edit Product' : 'Create New Product'}
        </h1>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/products')}
        >
          Cancel
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="form-label">Product Name *</label>
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
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      disabled={loading}
                      style={{ transform: 'scale(1.5)' }}
                    />
                    <label className="form-check-label">
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Description *</label>
              <textarea
                className="form-control"
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={loading}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Supplier</label>
                  <select
                    className="form-select"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    disabled={loading}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">SKU *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    disabled={loading || isEdit}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Barcode</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Min Stock Level</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Cost Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Tags</label>
              <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {tags.map(tag => (
                  <div key={tag.id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.tags.includes(tag.id)}
                      onChange={() => toggleTagSelection(tag.id)}
                      disabled={loading}
                    />
                    <label className="form-check-label">
                      <span
                        className="badge me-1"
                        style={{ backgroundColor: tag.color, color: 'white' }}
                      >
                        {tag.name}
                      </span>
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
                isEdit ? 'Update Product' : 'Create Product'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
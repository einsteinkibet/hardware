// src/components/Products/ProductList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI, supplierAPI, tagAPI } from '../../services/api';
import ProductFilters from './ProductFilters';
import ProductBulkActions from './ProductBulkActions';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    supplier: '',
    tag: '',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchInitialData();
    fetchProducts();
  }, [filters, pagination.page]);

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
        search: filters.search,
        category: filters.category,
        supplier: filters.supplier,
        tag: filters.tag,
        is_active: filters.status === 'all' ? null : filters.status === 'active'
      };

      const response = await productAPI.getAll(params);
      setProducts(response.data.results);
      setPagination(prev => ({
        ...prev,
        total: response.data.count
      }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleBulkAction = async (action, data) => {
    try {
      // Implement bulk actions based on your API
      console.log('Bulk action:', action, data);
      await fetchProducts(); // Refresh the list
      setSelectedProducts([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  if (loading && products.length === 0) {
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
        <h1 className="h3 mb-0">Products</h1>
        <Link to="/products/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>Add Product
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <ProductFilters
            filters={filters}
            categories={categories}
            suppliers={suppliers}
            tags={tags}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <ProductBulkActions
          selectedCount={selectedProducts.length}
          onAction={handleBulkAction}
          onClearSelection={() => setSelectedProducts([])}
        />
      )}

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={toggleAllSelection}
                      className="form-check-input"
                    />
                  </th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Barcode</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="form-check-input"
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0].image}
                            alt={product.name}
                            className="rounded me-3"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <strong>{product.name}</strong>
                          {product.tags.length > 0 && (
                            <div>
                              {product.tags.slice(0, 2).map(tag => (
                                <span
                                  key={tag.id}
                                  className="badge bg-secondary me-1"
                                  style={{ backgroundColor: tag.color }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                              {product.tags.length > 2 && (
                                <span className="badge bg-light text-dark">
                                  +{product.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{product.sku}</td>
                    <td>{product.barcode}</td>
                    <td>{product.category?.name}</td>
                    <td>${product.price}</td>
                    <td>
                      <span className={`badge ${
                        product.current_stock === 0 ? 'bg-danger' :
                        product.current_stock <= product.min_stock_level ? 'bg-warning' : 'bg-success'
                      }`}>
                        {product.current_stock}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        product.is_active ? 'bg-success' : 'bg-secondary'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <Link
                          to={`/products/${product.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        <button className="btn btn-sm btn-outline-secondary">
                          <i className="fas fa-edit"></i>
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

          {products.length === 0 && !loading && (
            <div className="text-center py-4">
              <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
              <p className="text-muted">No products found</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.pageSize && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(Math.ceil(pagination.total / pagination.pageSize)).keys()].map(num => (
                  <li key={num + 1} className={`page-item ${pagination.page === num + 1 ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPagination(prev => ({ ...prev, page: num + 1 }))}
                    >
                      {num + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${pagination.page * pagination.pageSize >= pagination.total ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
// src/components/Inventory/InventoryManagement.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryAPI, productAPI } from '../../services/api';
import SearchBar from '../Common/SearchBar';
import LoadingSpinner from '../Common/LoadingSpinner';
import StockAdjustment from './StockAdjustment';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    lowStock: false
  });

  useEffect(() => {
    fetchInventory();
  }, [filters]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {
        search: filters.search,
        low_stock: filters.lowStock
      };
      const response = await inventoryAPI.getAll(params);
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setShowAdjustmentModal(true);
  };

  if (loading) {
    return <LoadingSpinner text="Loading inventory..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Inventory Management</h1>
        <Link to="/low-stock" className="btn btn-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>View Low Stock
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <SearchBar onSearch={handleSearch} placeholder="Search inventory..." />
            </div>
            <div className="col-md-6">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={filters.lowStock}
                  onChange={(e) => setFilters(prev => ({ ...prev, lowStock: e.target.checked }))}
                />
                <label className="form-check-label">Show only low stock</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                  <th>Min Level</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/products/${item.product.id}`} className="text-decoration-none">
                        <strong>{item.product.name}</strong>
                      </Link>
                    </td>
                    <td>{item.product.sku}</td>
                    <td>
                      <span className={`badge ${
                        item.quantity === 0 ? 'bg-danger' :
                        item.quantity <= item.product.min_stock_level ? 'bg-warning' : 'bg-success'
                      }`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td>{item.product.min_stock_level}</td>
                    <td>
                      <span className={`badge ${
                        item.quantity === 0 ? 'bg-danger' :
                        item.quantity <= item.product.min_stock_level ? 'bg-warning' : 'bg-success'
                      }`}>
                        {item.quantity === 0 ? 'Out of Stock' :
                         item.quantity <= item.product.min_stock_level ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td>{item.location || 'N/A'}</td>
                    <td>{new Date(item.last_restocked).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleAdjustStock(item.product)}
                      >
                        <i className="fas fa-edit me-1"></i>Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAdjustmentModal && selectedProduct && (
        <StockAdjustment
          product={selectedProduct}
          onClose={() => {
            setShowAdjustmentModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={fetchInventory}
        />
      )}
    </div>
  );
};

export default InventoryManagement;
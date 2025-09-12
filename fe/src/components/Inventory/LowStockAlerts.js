// src/components/Inventory/LowStockAlerts.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const LowStockAlerts = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const response = await productAPI.getLowStock();
      setLowStockProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch low stock products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading low stock alerts..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Low Stock Alerts</h1>
        <button className="btn btn-primary" onClick={fetchLowStockProducts}>
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
              <h5>No Low Stock Items</h5>
              <p className="text-muted">All products have sufficient stock levels.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Minimum Level</th>
                    <th>Difference</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(product => (
                    <tr key={product.id} className="table-warning">
                      <td>
                        <Link to={`/products/${product.id}`} className="text-decoration-none">
                          <strong>{product.name}</strong>
                          <br />
                          <small className="text-muted">SKU: {product.sku}</small>
                        </Link>
                      </td>
                      <td>{product.current_stock}</td>
                      <td>{product.min_stock_level}</td>
                      <td>
                        <span className="badge bg-danger">
                          {product.current_stock - product.min_stock_level}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-warning">Low Stock</span>
                      </td>
                      <td>
                        <Link
                          to={`/products/${product.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fas fa-edit me-1"></i>Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LowStockAlerts;
// src/components/Products/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  productAPI, 
  productImageAPI, 
  inventoryAPI, 
  barcodeScanAPI,
  inventoryHistoryAPI 
} from '../../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [barcodeScans, setBarcodeScans] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const productResponse = await productAPI.getById(id);
      setProduct(productResponse.data);
      
      if (activeTab === 'barcode') {
        const scansResponse = await barcodeScanAPI.getByProduct(id);
        setBarcodeScans(scansResponse.data);
      }
      
      if (activeTab === 'inventory') {
        const historyResponse = await inventoryHistoryAPI.getByProduct(id);
        setInventoryHistory(historyResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch product data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if ((tab === 'barcode' && barcodeScans.length === 0) || 
        (tab === 'inventory' && inventoryHistory.length === 0)) {
      fetchProductData();
    }
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

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">{product.name}</h1>
          <p className="text-muted mb-0">SKU: {product.sku} | Barcode: {product.barcode}</p>
        </div>
        <div className="btn-group">
          <button className="btn btn-outline-primary">
            <i className="fas fa-edit me-2"></i>Edit
          </button>
          <button className="btn btn-outline-danger">
            <i className="fas fa-trash me-2"></i>Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => handleTabChange('info')}
          >
            Product Info
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => handleTabChange('images')}
          >
            Images
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => handleTabChange('inventory')}
          >
            Inventory
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'barcode' ? 'active' : ''}`}
            onClick={() => handleTabChange('barcode')}
          >
            Barcode Scans
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Basic Information</h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Name:</div>
                    <div className="col-sm-8">{product.name}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Description:</div>
                    <div className="col-sm-8">{product.description}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">SKU:</div>
                    <div className="col-sm-8">{product.sku}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Barcode:</div>
                    <div className="col-sm-8">{product.barcode}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Category:</div>
                    <div className="col-sm-8">
                      {product.category ? (
                        <span className="badge bg-primary">{product.category.name}</span>
                      ) : (
                        'Uncategorized'
                      )}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Supplier:</div>
                    <div className="col-sm-8">
                      {product.supplier ? product.supplier.name : 'No supplier'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Pricing & Stock</h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Price:</div>
                    <div className="col-sm-8">${product.price}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Cost Price:</div>
                    <div className="col-sm-8">${product.cost_price}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Current Stock:</div>
                    <div className="col-sm-8">
                      <span className={`badge ${
                        product.current_stock === 0 ? 'bg-danger' :
                        product.current_stock <= product.min_stock_level ? 'bg-warning' : 'bg-success'
                      }`}>
                        {product.current_stock} units
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Min Stock Level:</div>
                    <div className="col-sm-8">{product.min_stock_level} units</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Status:</div>
                    <div className="col-sm-8">
                      <span className={`badge ${product.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-bold">Tags:</div>
                    <div className="col-sm-8">
                      {product.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="badge me-1"
                          style={{ backgroundColor: tag.color, color: 'white' }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Inventory History</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Action</th>
                      <th>Old Qty</th>
                      <th>New Qty</th>
                      <th>Difference</th>
                      <th>Reason</th>
                      <th>Changed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryHistory.map(history => (
                      <tr key={history.id}>
                        <td>{new Date(history.changed_at).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${
                            history.action_type === 'restock' ? 'bg-success' :
                            history.action_type === 'sale' ? 'bg-primary' :
                            history.action_type === 'damage' ? 'bg-danger' : 'bg-warning'
                          }`}>
                            {history.action_type}
                          </span>
                        </td>
                        <td>{history.old_quantity}</td>
                        <td>{history.new_quantity}</td>
                        <td>
                          <span className={`badge ${
                            history.difference > 0 ? 'bg-success' : 'bg-danger'
                          }`}>
                            {history.difference > 0 ? '+' : ''}{history.difference}
                          </span>
                        </td>
                        <td>{history.reason}</td>
                        <td>{history.changed_by?.username || 'System'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'barcode' && (
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Barcode Scan History</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Scanned At</th>
                      <th>Scanned By</th>
                      <th>Scan Type</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barcodeScans.map(scan => (
                      <tr key={scan.id}>
                        <td>{new Date(scan.scanned_at).toLocaleString()}</td>
                        <td>{scan.scanned_by.username}</td>
                        <td>
                          <span className="badge bg-info">{scan.scan_type}</span>
                        </td>
                        <td>{scan.location || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
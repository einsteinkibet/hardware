// src/components/Barcode/ScanHistory.js
import React, { useState, useEffect } from 'react';
import { barcodeScanAPI } from '../../services/api';

const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    scan_type: '',
    product: ''
  });

  useEffect(() => {
    fetchScans();
  }, [filters]);

  const fetchScans = async () => {
    try {
      const params = {};
      if (filters.scan_type) params.scan_type = filters.scan_type;
      if (filters.product) params.product = filters.product;

      const response = await barcodeScanAPI.getAll(params);
      setScans(response.data);
    } catch (error) {
      console.error('Failed to fetch scan history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScanTypeBadge = (scanType) => {
    const typeColors = {
      sale: 'success',
      inventory: 'info',
      receiving: 'primary',
      association: 'warning'
    };
    return `bg-${typeColors[scanType]}`;
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
        <h1 className="h3 mb-0">Barcode Scan History</h1>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Scan Type</label>
              <select
                className="form-select"
                value={filters.scan_type}
                onChange={(e) => setFilters({ ...filters, scan_type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="sale">Sale</option>
                <option value="inventory">Inventory Check</option>
                <option value="receiving">Receiving</option>
                <option value="association">Product Association</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Filter by product..."
                value={filters.product}
                onChange={(e) => setFilters({ ...filters, product: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scan History Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product</th>
                  <th>Scanned By</th>
                  <th>Scan Type</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {scans.map(scan => (
                  <tr key={scan.id}>
                    <td>{new Date(scan.scanned_at).toLocaleString()}</td>
                    <td>
                      <strong>{scan.product.name}</strong>
                      <br />
                      <small className="text-muted">SKU: {scan.product.sku}</small>
                    </td>
                    <td>{scan.scanned_by.username}</td>
                    <td>
                      <span className={`badge ${getScanTypeBadge(scan.scan_type)}`}>
                        {scan.scan_type}
                      </span>
                    </td>
                    <td>{scan.location || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {scans.length === 0 && !loading && (
            <div className="text-center py-4">
              <i className="fas fa-barcode fa-3x text-muted mb-3"></i>
              <p className="text-muted">No scan history found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanHistory;
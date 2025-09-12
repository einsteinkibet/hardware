// src/components/Help/Tooltips.js
import React, { useState, useEffect } from 'react';
import { helpTipAPI } from '../../services/api';

const Tooltips = () => {
  const [tooltips, setTooltips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTooltips();
  }, []);

  const fetchTooltips = async () => {
    try {
      const response = await helpTipAPI.getAll();
      setTooltips(response.data);
    } catch (error) {
      console.error('Failed to fetch tooltips:', error);
    } finally {
      setLoading(false);
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Help Tips & Tooltips</h1>
        <button className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>Add New Tip
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Page URL</th>
                  <th>Content Preview</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tooltips.map(tooltip => (
                  <tr key={tooltip.id}>
                    <td>
                      <strong>{tooltip.title}</strong>
                    </td>
                    <td>
                      <code>{tooltip.page_url}</code>
                    </td>
                    <td>
                      {tooltip.content.length > 100 
                        ? `${tooltip.content.substring(0, 100)}...` 
                        : tooltip.content
                      }
                    </td>
                    <td>
                      <span className={`badge ${tooltip.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {tooltip.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{tooltip.order}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-primary">
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

          {tooltips.length === 0 && !loading && (
            <div className="text-center py-4">
              <i className="fas fa-lightbulb fa-3x text-muted mb-3"></i>
              <p className="text-muted">No help tips configured</p>
              <button className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>Create First Tip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tooltips;
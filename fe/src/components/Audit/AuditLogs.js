// src/components/Audit/AuditLogs.js
import React, { useState, useEffect } from 'react';
import { auditLogAPI } from '../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    model_name: '',
    user: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      const params = {};
      if (filters.action) params.action = filters.action;
      if (filters.model_name) params.model_name = filters.model_name;
      if (filters.user) params.user = filters.user;

      const response = await auditLogAPI.getAll(params);
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const actionColors = {
      create: 'success',
      update: 'warning',
      delete: 'danger',
      view: 'info'
    };
    return `bg-${actionColors[action]}`;
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
        <h1 className="h3 mb-0">Audit Logs</h1>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Action Type</label>
              <select
                className="form-select"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="view">View</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Model Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Filter by model..."
                value={filters.model_name}
                onChange={(e) => setFilters({ ...filters, model_name: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">User</label>
              <input
                type="text"
                className="form-control"
                placeholder="Filter by user..."
                value={filters.user}
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Model</th>
                  <th>Object ID</th>
                  <th>IP Address</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.user?.username || 'System'}</td>
                    <td>
                      <span className={`badge ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.model_name}</td>
                    <td>#{log.object_id}</td>
                    <td>{log.ip_address || 'N/A'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => console.log('View details', log.details)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && !loading && (
            <div className="text-center py-4">
              <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
              <p className="text-muted">No audit logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
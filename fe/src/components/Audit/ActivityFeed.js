// src/components/Audit/ActivityFeed.js
import React, { useState, useEffect } from 'react';
import { auditLogAPI } from '../../services/api';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await auditLogAPI.getAll({ ordering: '-timestamp', limit: 50 });
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create': return 'fas fa-plus-circle text-success';
      case 'update': return 'fas fa-edit text-warning';
      case 'delete': return 'fas fa-trash text-danger';
      case 'view': return 'fas fa-eye text-info';
      default: return 'fas fa-circle text-secondary';
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
        <h1 className="h3 mb-0">Recent Activity</h1>
        <button className="btn btn-outline-primary" onClick={fetchActivities}>
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          {activities.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
              <p className="text-muted">No recent activity</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {activities.map(activity => (
                <div key={activity.id} className="list-group-item">
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1">
                      <i className={`${getActionIcon(activity.action)} fa-lg`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-1">{activity.user?.username || 'System'}</h6>
                        <small className="text-muted">
                          {new Date(activity.timestamp).toLocaleString()}
                        </small>
                      </div>
                      <p className="mb-1">
                        <strong>{activity.action}d</strong> {activity.model_name} #{activity.object_id}
                      </p>
                      {activity.ip_address && (
                        <small className="text-muted">IP: {activity.ip_address}</small>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
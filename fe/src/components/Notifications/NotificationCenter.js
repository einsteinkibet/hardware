// src/components/Notifications/NotificationCenter.js
import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import { toast } from 'react-toastify';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      let filteredNotifications = response.data;
      
      if (filter === 'unread') {
        filteredNotifications = response.data.filter(n => !n.is_read);
      } else if (filter === 'read') {
        filteredNotifications = response.data.filter(n => n.is_read);
      }
      
      setNotifications(filteredNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'low_stock': return 'fas fa-exclamation-triangle text-warning';
      case 'new_order': return 'fas fa-shopping-cart text-primary';
      case 'payment_received': return 'fas fa-money-bill-wave text-success';
      case 'debt_reminder': return 'fas fa-clock text-danger';
      default: return 'fas fa-bell text-info';
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
        <h1 className="h3 mb-0">Notifications</h1>
        <div className="btn-group">
          <button
            className={`btn btn-outline-primary ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`btn btn-outline-primary ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button
            className={`btn btn-outline-primary ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
          <button
            className="btn btn-primary"
            onClick={markAllAsRead}
            disabled={notifications.filter(n => !n.is_read).length === 0}
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
              <p className="text-muted">No notifications found</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`list-group-item ${!notification.is_read ? 'bg-light' : ''}`}
                >
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1">
                      <i className={`${getNotificationIcon(notification.type)} fa-lg`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{notification.title}</h6>
                      <p className="mb-1">{notification.message}</p>
                      <small className="text-muted">
                        {new Date(notification.created_at).toLocaleString()}
                      </small>
                    </div>
                    <div className="btn-group">
                      {!notification.is_read && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
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

export default NotificationCenter;
// src/components/Notifications/NotificationDropdown.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const handleMarkAsRead = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    markAsRead(id);
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-light dropdown-toggle position-relative"
        type="button"
        id="notificationDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>
      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown">
        <li className="dropdown-header">Notifications</li>
        {notifications.slice(0, 5).map(notification => (
          <li key={notification.id}>
            <Link
              to="#"
              className={`dropdown-item ${!notification.is_read ? 'fw-bold' : ''}`}
              onClick={(e) => handleMarkAsRead(notification.id, e)}
            >
              <div className="d-flex align-items-center">
                <i className={`fas fa-bell me-2 ${!notification.is_read ? 'text-primary' : 'text-muted'}`}></i>
                <div>
                  <div className="small">{notification.title}</div>
                  <small className="text-muted">{notification.message}</small>
                </div>
              </div>
            </Link>
          </li>
        ))}
        {notifications.length === 0 && (
          <li><span className="dropdown-item-text">No notifications</span></li>
        )}
        <li><hr className="dropdown-divider" /></li>
        <li>
          <Link to="/notifications" className="dropdown-item text-center">
            View all notifications
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default NotificationDropdown;
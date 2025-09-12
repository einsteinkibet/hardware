// src/components/Layout/Navbar.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from '../Notifications/NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">
          <i className="fas fa-hard-hat me-2"></i>
          HardwarePro Manager
        </span>
        
        <div className="d-flex align-items-center">
          <NotificationDropdown />
          
          <div className="dropdown ms-3">
            <button 
              className="btn btn-outline-light dropdown-toggle" 
              type="button" 
              id="userDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="fas fa-user-circle me-1"></i>
              {user?.first_name || user?.username}
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li><span className="dropdown-item-text">{user?.email}</span></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item" onClick={logout}>
                  <i className="fas fa-sign-out-alt me-2"></i>Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
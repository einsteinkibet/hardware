// src/components/Layout/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/products', icon: 'fas fa-box', label: 'Products' },
    { path: '/inventory', icon: 'fas fa-warehouse', label: 'Inventory' },
    { path: '/orders', icon: 'fas fa-shopping-cart', label: 'Orders' },
    { path: '/cart', icon: 'fas fa-cart-plus', label: 'POS Checkout' },
    { path: '/customers', icon: 'fas fa-users', label: 'Customers' },
    { path: '/payments', icon: 'fas fa-credit-card', label: 'Payments' },
    { path: '/debts', icon: 'fas fa-file-invoice-dollar', label: 'Debts' },
    { path: '/expenses', icon: 'fas fa-money-bill-wave', label: 'Expenses' },
    { path: '/suppliers', icon: 'fas fa-truck-loading', label: 'Suppliers' },
    { path: '/categories', icon: 'fas fa-tags', label: 'Categories & Tags' },
    { path: '/notifications', icon: 'fas fa-bell', label: 'Notifications' },
    { path: '/audit-logs', icon: 'fas fa-clipboard-list', label: 'Audit Logs' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
    { path: '/help', icon: 'fas fa-question-circle', label: 'Help Tips' }
  ];

  return (
    <div className={`sidebar bg-dark text-white ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header d-flex justify-content-between align-items-center p-3">
        {!collapsed && <h5 className="mb-0">Navigation</h5>}
        <button className="btn btn-link text-white p-0" onClick={toggleSidebar}>
          <i className={`fas ${collapsed ? 'fa-bars' : 'fa-times'}`}></i>
        </button>
      </div>
      
      <ul className="nav flex-column">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link 
              to={item.path} 
              className={`nav-link text-white ${location.pathname === item.path ? 'active bg-primary' : ''}`}
            >
              <i className={`${item.icon} me-3`}></i>
              {!collapsed && item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
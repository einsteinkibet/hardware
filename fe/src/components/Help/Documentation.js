// src/components/Help/Documentation.js
import React from 'react';

const Documentation = () => {
  const sections = [
    {
      title: 'Getting Started',
      content: 'Learn how to set up and use HardwarePro Manager effectively.',
      items: [
        'System Requirements',
        'Installation Guide',
        'First Time Setup',
        'User Permissions'
      ]
    },
    {
      title: 'Inventory Management',
      content: 'Manage your product inventory efficiently.',
      items: [
        'Adding New Products',
        'Managing Stock Levels',
        'Setting Low Stock Alerts',
        'Inventory Auditing'
      ]
    },
    {
      title: 'Sales & POS',
      content: 'Process sales and manage point-of-sale operations.',
      items: [
        'Creating Sales',
        'Processing Payments',
        'Managing Customer Orders',
        'Handling Returns'
      ]
    },
    {
      title: 'Customer Management',
      content: 'Manage customer accounts and credit facilities.',
      items: [
        'Adding New Customers',
        'Managing Credit Limits',
        'Tracking Customer Balances',
        'Debt Management'
      ]
    },
    {
      title: 'Reports & Analytics',
      content: 'Generate reports and analyze business performance.',
      items: [
        'Sales Reports',
        'Inventory Reports',
        'Financial Statements',
        'Customer Analytics'
      ]
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Documentation</h1>
      </div>

      <div className="row">
        {sections.map((section, index) => (
          <div key={index} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">{section.title}</h5>
              </div>
              <div className="card-body">
                <p className="card-text">{section.content}</p>
                <ul className="list-unstyled">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="mb-1">
                      <i className="fas fa-chevron-right text-primary me-2"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-footer">
                <button className="btn btn-sm btn-outline-primary">
                  Learn More <i className="fas fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-4">
        <div className="card-body text-center">
          <i className="fas fa-question-circle fa-3x text-primary mb-3"></i>
          <h4>Need More Help?</h4>
          <p className="text-muted">
            Contact our support team for additional assistance
          </p>
          <button className="btn btn-primary">
            <i className="fas fa-envelope me-2"></i>Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
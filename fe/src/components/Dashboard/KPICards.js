// src/components/Dashboard/KPICards.js
import React from 'react';

const KPICards = ({ kpis }) => {
  const cards = [
    {
      title: 'Total Revenue',
      value: `$${kpis.total_revenue || 0}`,
      subtitle: `${kpis.revenue_growth || 0}% from last month`,
      icon: 'fas fa-dollar-sign',
      bg: 'bg-primary',
      text: 'text-white'
    },
    {
      title: 'Total Orders',
      value: kpis.total_orders || 0,
      subtitle: `${kpis.avg_order_value || 0} avg. order value`,
      icon: 'fas fa-shopping-cart',
      bg: 'bg-success',
      text: 'text-white'
    },
    {
      title: 'Total Customers',
      value: kpis.total_customers || 0,
      subtitle: `${kpis.new_customers_this_month || 0} new this month`,
      icon: 'fas fa-users',
      bg: 'bg-info',
      text: 'text-white'
    },
    {
      title: 'Low Stock Items',
      value: kpis.low_stock_items || 0,
      subtitle: 'Needs immediate attention',
      icon: 'fas fa-exclamation-triangle',
      bg: 'bg-warning',
      text: 'text-dark'
    }
  ];

  return (
    <div className="row mb-4">
      {cards.map((card, index) => (
        <div key={index} className="col-md-3 mb-3">
          <div className={`card ${card.bg} ${card.text}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title">{card.title}</h5>
                  <h2 className="card-text">{card.value}</h2>
                  <p className="card-text">{card.subtitle}</p>
                </div>
                <i className={`${card.icon} fa-2x opacity-50`}></i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  dashboardAPI, 
  productAPI, 
  orderAPI, 
  inventoryAPI 
} from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [kpis, setKpis] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        kpisResponse, 
        salesResponse, 
        topProductsResponse, 
        lowStockResponse, 
        activityResponse
      ] = await Promise.all([
        dashboardAPI.getKPIs(),
        dashboardAPI.getSalesData(),
        dashboardAPI.getTopProducts(),
        dashboardAPI.getLowStockAlerts(),
        dashboardAPI.getRecentActivity()
      ]);

      setKpis(kpisResponse.data);
      setSalesData(salesResponse.data);
      setTopProducts(topProductsResponse.data);
      setLowStockAlerts(lowStockResponse.data);
      setRecentActivity(activityResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
        <h1 className="h3 mb-0">Dashboard</h1>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Revenue</h5>
              <h2 className="card-text">${kpis.total_revenue || 0}</h2>
              <p className="card-text">
                <i className="fas fa-arrow-up me-1"></i>
                {kpis.revenue_growth || 0}% from last month
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Total Orders</h5>
              <h2 className="card-text">{kpis.total_orders || 0}</h2>
              <p className="card-text">
                <i className="fas fa-shopping-cart me-1"></i>
                {kpis.avg_order_value || 0} avg. order value
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Total Customers</h5>
              <h2 className="card-text">{kpis.total_customers || 0}</h2>
              <p className="card-text">
                <i className="fas fa-users me-1"></i>
                {kpis.new_customers_this_month || 0} new this month
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Low Stock Items</h5>
              <h2 className="card-text">{kpis.low_stock_items || 0}</h2>
              <p className="card-text">
                <i className="fas fa-exclamation-triangle me-1"></i>
                Needs immediate attention
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Sales Chart */}
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Monthly Sales</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#0d6efd" name="Sales ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Top Selling Products</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-primary me-2">{index + 1}</span>
                      {product.name}
                    </div>
                    <span className="badge bg-success">{product.total_sold} sold</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Low Stock Alerts */}
        <div className="col-md-6 mb-4">
          <div className="card border-danger">
            <div className="card-header bg-danger text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Low Stock Alerts
              </h5>
            </div>
            <div className="card-body">
              {lowStockAlerts.length > 0 ? (
                <div className="list-group">
                  {lowStockAlerts.slice(0, 5).map(product => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{product.name}</span>
                        <span className="badge bg-danger">
                          {product.current_stock} left (min: {product.min_stock_level})
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No low stock items</p>
              )}
              {lowStockAlerts.length > 5 && (
                <div className="text-center mt-3">
                  <Link to="/inventory" className="btn btn-sm btn-outline-danger">
                    View All ({lowStockAlerts.length})
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              {recentActivity.length > 0 ? (
                <div className="list-group">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <strong>{activity.description}</strong>
                        <small className="text-muted">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </small>
                      </div>
                      <small className="text-muted">By: {activity.user}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
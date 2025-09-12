// src/components/Reports/AdvancedReports.js
import React, { useState, useEffect } from 'react';
import { reportsAPI, exportAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdvancedReports = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'sales', label: 'Sales Report', color: '#8884d8' },
    { value: 'inventory', label: 'Inventory Report', color: '#82ca9d' },
    { value: 'customers', label: 'Customer Report', color: '#ffc658' },
    { value: 'debts', label: 'Debts Report', color: '#ff8042' }
  ];

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange]);

  const generateReport = async () => {
    setLoading(true);
    try {
      let response;
      switch (reportType) {
        case 'sales':
          response = await reportsAPI.sales(dateRange.startDate, dateRange.endDate);
          break;
        case 'inventory':
          response = await reportsAPI.inventory();
          break;
        case 'customers':
          response = await reportsAPI.customers();
          break;
        case 'debts':
          response = await reportsAPI.debts();
          break;
        default:
          response = await reportsAPI.sales(dateRange.startDate, dateRange.endDate);
      }
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      let response;
      switch (reportType) {
        case 'sales':
          response = await exportAPI.orders(format);
          break;
        case 'inventory':
          response = await exportAPI.inventory(format);
          break;
        case 'customers':
          response = await exportAPI.customers(format);
          break;
        default:
          response = await exportAPI.orders(format);
      }
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const renderSalesReport = () => (
    <div>
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Total Sales</h6>
              <h3 className="card-text">${reportData?.summary?.total_sales?.toFixed(2) || '0.00'}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">Total Orders</h6>
              <h3 className="card-text">{reportData?.summary?.total_orders || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6 className="card-title">Average Order</h6>
              <h3 className="card-text">${reportData?.summary?.average_order?.toFixed(2) || '0.00'}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h6 className="card-title">Top Product</h6>
              <h3 className="card-text">{reportData?.summary?.top_product || 'N/A'}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Sales Trend</h5>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData?.daily_sales || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" name="Daily Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderInventoryReport = () => (
    <div>
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Total Products</h6>
              <h3 className="card-text">{reportData?.summary?.total_products || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h6 className="card-title">Low Stock Items</h6>
              <h3 className="card-text">{reportData?.summary?.low_stock_count || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h6 className="card-title">Out of Stock</h6>
              <h3 className="card-text">{reportData?.summary?.out_of_stock_count || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Inventory by Category</h5>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData?.category_distribution || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {reportData?.category_distribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Advanced Reports</h1>
        <div className="btn-group">
          <button className="btn btn-outline-primary" onClick={() => exportReport('excel')}>
            <i className="fas fa-file-excel me-2"></i>Export Excel
          </button>
          <button className="btn btn-outline-danger" onClick={() => exportReport('pdf')}>
            <i className="fas fa-file-pdf me-2"></i>Export PDF
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4">
              <label className="form-label">Report Type</label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Generating report...</p>
        </div>
      ) : (
        <>
          {reportType === 'sales' && renderSalesReport()}
          {reportType === 'inventory' && renderInventoryReport()}
          {reportType === 'customers' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Customer Report</h5>
                <p>Customer report data will be displayed here.</p>
              </div>
            </div>
          )}
          {reportType === 'debts' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Debts Report</h5>
                <p>Debts report data will be displayed here.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdvancedReports;
// src/components/Orders/OrderList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import SearchBar from '../Common/SearchBar';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../utils/constants';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    payment_status: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        search: filters.search,
        status: filters.status,
        payment_status: filters.payment_status
      };
      const response = await orderAPI.getAll(params);
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      [ORDER_STATUS.PENDING]: 'bg-warning',
      [ORDER_STATUS.CONFIRMED]: 'bg-info',
      [ORDER_STATUS.PROCESSING]: 'bg-primary',
      [ORDER_STATUS.SHIPPED]: 'bg-success',
      [ORDER_STATUS.DELIVERED]: 'bg-success',
      [ORDER_STATUS.CANCELLED]: 'bg-danger',
      [ORDER_STATUS.REFUNDED]: 'bg-secondary'
    };
    return statusConfig[status] || 'bg-secondary';
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      [PAYMENT_STATUS.PENDING]: 'bg-warning',
      [PAYMENT_STATUS.PARTIAL]: 'bg-info',
      [PAYMENT_STATUS.PAID]: 'bg-success',
      [PAYMENT_STATUS.REFUNDED]: 'bg-secondary'
    };
    return statusConfig[status] || 'bg-secondary';
  };

  if (loading) {
    return <LoadingSpinner text="Loading orders..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Orders</h1>
        <Link to="/order-kanban" className="btn btn-outline-primary">
          <i className="fas fa-kanban me-2"></i>Kanban View
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <SearchBar onSearch={(search) => setFilters({ ...filters, search })} placeholder="Search orders..." />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                {Object.values(ORDER_STATUS).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filters.payment_status}
                onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
              >
                <option value="">All Payment Statuses</option>
                {Object.values(PAYMENT_STATUS).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <Link to={`/orders/${order.id}`} className="text-decoration-none">
                        <strong>#{order.order_number}</strong>
                      </Link>
                    </td>
                    <td>{order.customer?.user?.first_name} {order.customer?.user?.last_name}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>{order.items_count}</td>
                    <td>${order.total}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getPaymentStatusBadge(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/orders/${order.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
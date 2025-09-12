// src/components/Orders/OrderStatusKanban.js
import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { ORDER_STATUS } from '../../utils/constants';

const OrderStatusKanban = () => {
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      const ordersByStatus = {};
      
      Object.values(ORDER_STATUS).forEach(status => {
        ordersByStatus[status] = [];
      });

      response.data.forEach(order => {
        if (ordersByStatus[order.status]) {
          ordersByStatus[order.status].push(order);
        }
      });

      setOrders(ordersByStatus);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      [ORDER_STATUS.PENDING]: 'bg-warning',
      [ORDER_STATUS.CONFIRMED]: 'bg-info',
      [ORDER_STATUS.PROCESSING]: 'bg-primary',
      [ORDER_STATUS.SHIPPED]: 'bg-success',
      [ORDER_STATUS.DELIVERED]: 'bg-success',
      [ORDER_STATUS.CANCELLED]: 'bg-danger',
      [ORDER_STATUS.REFUNDED]: 'bg-secondary'
    };
    return colors[status] || 'bg-secondary';
  };

  if (loading) {
    return <LoadingSpinner text="Loading orders..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Order Kanban Board</h1>
        <button className="btn btn-primary" onClick={fetchOrders}>
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      <div className="row">
        {Object.entries(orders).map(([status, statusOrders]) => (
          <div key={status} className="col-lg-3 col-md-6 mb-4">
            <div className="card">
              <div className={`card-header text-white ${getStatusColor(status)}`}>
                <h6 className="card-title mb-0 text-capitalize">
                  {status} ({statusOrders.length})
                </h6>
              </div>
              <div className="card-body" style={{ minHeight: '400px', maxHeight: '400px', overflowY: 'auto' }}>
                {statusOrders.map(order => (
                  <div key={order.id} className="card mb-2">
                    <div className="card-body p-2">
                      <h6 className="card-title mb-1">#{order.order_number}</h6>
                      <p className="card-text mb-1 small">
                        {order.customer?.user?.first_name} {order.customer?.user?.last_name}
                      </p>
                      <p className="card-text mb-1 small">${order.total}</p>
                      <p className="card-text mb-0 small">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {statusOrders.length === 0 && (
                  <div className="text-center text-muted py-3">
                    <i className="fas fa-inbox fa-2x mb-2"></i>
                    <p>No orders</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusKanban;
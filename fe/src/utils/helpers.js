// src/utils/helpers.js
export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

export const calculateOrderTotal = (items, taxRate = 0, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;
  return { subtotal, tax, total };
};

export const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { class: 'bg-warning', text: 'Pending' },
    confirmed: { class: 'bg-info', text: 'Confirmed' },
    processing: { class: 'bg-primary', text: 'Processing' },
    shipped: { class: 'bg-success', text: 'Shipped' },
    delivered: { class: 'bg-success', text: 'Delivered' },
    cancelled: { class: 'bg-danger', text: 'Cancelled' },
    refunded: { class: 'bg-secondary', text: 'Refunded' }
  };

  const config = statusConfig[status] || { class: 'bg-secondary', text: status };
  return `<span class="badge ${config.class}">${config.text}</span>`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
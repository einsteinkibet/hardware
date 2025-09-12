// src/services/api.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  register: (userData) => api.post('/auth/register/', userData),
  changePassword: (passwords) => api.post('/auth/password/change/', passwords),
  resetPassword: (email) => api.post('/auth/password/reset/', { email }),
  resetPasswordConfirm: (data) => api.post('/auth/password/reset/confirm/', data),
  refreshToken: () => api.post('/auth/token/refresh/'),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (profileData) => api.put('/auth/profile/', profileData),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories/'),
  getById: (id) => api.get(`/categories/${id}/`),
  create: (categoryData) => api.post('/categories/', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}/`, categoryData),
  delete: (id) => api.delete(`/categories/${id}/`),
  getProducts: (id) => api.get(`/categories/${id}/products/`),
};

// Supplier API
export const supplierAPI = {
  getAll: (params = {}) => api.get('/suppliers/', { params }),
  getById: (id) => api.get(`/suppliers/${id}/`),
  create: (supplierData) => api.post('/suppliers/', supplierData),
  update: (id, supplierData) => api.put(`/suppliers/${id}/`, supplierData),
  delete: (id) => api.delete(`/suppliers/${id}/`),
  getProducts: (id) => api.get(`/suppliers/${id}/products/`),
};

// Tag API
export const tagAPI = {
  getAll: () => api.get('/tags/'),
  getById: (id) => api.get(`/tags/${id}/`),
  create: (tagData) => api.post('/tags/', tagData),
  update: (id, tagData) => api.put(`/tags/${id}/`, tagData),
  delete: (id) => api.delete(`/tags/${id}/`),
};

// Product API
export const productAPI = {
  getAll: (params = {}) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}/`),
  create: (productData) => api.post('/products/', productData),
  update: (id, productData) => api.put(`/products/${id}/`, productData),
  delete: (id) => api.delete(`/products/${id}/`),
  search: (query, filters = {}) => api.get('/products/search/', { params: { q: query, ...filters } }),
  getLowStock: () => api.get('/products/low-stock/'),
  getOutOfStock: () => api.get('/products/out-of-stock/'),
};

// Product Image API
export const productImageAPI = {
  getByProduct: (productId) => api.get(`/products/${productId}/images/`),
  upload: (productId, imageData) => {
    const formData = new FormData();
    formData.append('image', imageData);
    formData.append('product', productId);
    return api.post(`/products/${productId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  setPrimary: (imageId) => api.post(`/product-images/${imageId}/set-primary/`),
  delete: (imageId) => api.delete(`/product-images/${imageId}/`),
};

// Inventory API
export const inventoryAPI = {
  getAll: (params = {}) => api.get('/inventory/', { params }),
  getById: (id) => api.get(`/inventory/${id}/`),
  update: (id, inventoryData) => api.put(`/inventory/${id}/`, inventoryData),
  adjust: (id, adjustmentData) => api.post(`/inventory/${id}/adjust/`, adjustmentData),
  getHistory: (id) => api.get(`/inventory/${id}/history/`),
  getLowStock: () => api.get('/inventory/low-stock/'),
  getOutOfStock: () => api.get('/inventory/out-of-stock/'),
};

// Customer API
export const customerAPI = {
  getAll: (params = {}) => api.get('/customers/', { params }),
  getById: (id) => api.get(`/customers/${id}/`),
  create: (customerData) => api.post('/customers/', customerData),
  update: (id, customerData) => api.put(`/customers/${id}/`, customerData),
  adjustBalance: (id, adjustmentData) => api.post(`/customers/${id}/adjust-balance/`, adjustmentData),
  getOrders: (id) => api.get(`/customers/${id}/orders/`),
  getTransactions: (id) => api.get(`/customers/${id}/transactions/`),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart/'),
  addItem: (productId, quantity = 1) => api.post('/cart/add/', { product_id: productId, quantity }),
  updateItem: (itemId, quantity) => api.put(`/cart/items/${itemId}/`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}/`),
  clear: () => api.delete('/cart/clear/'),
};

// Order API
export const orderAPI = {
  getAll: (params = {}) => api.get('/orders/', { params }),
  getById: (id) => api.get(`/orders/${id}/`),
  create: (orderData) => api.post('/orders/', orderData),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status/`, { status }),
  addPayment: (id, paymentData) => api.post(`/orders/${id}/payments/`, paymentData),
  getReceipt: (id, format = 'html') => api.get(`/orders/${id}/receipt/`, { 
    params: { format },
    responseType: format === 'pdf' ? 'blob' : 'json'
  }),
  checkout: () => api.post('/checkout/'),
};

// Payment API
export const paymentAPI = {
  getByOrder: (orderId) => api.get(`/orders/${orderId}/payments/`),
  getById: (id) => api.get(`/payments/${id}/`),
  process: (paymentData) => api.post('/payments/process/', paymentData),
  refund: (paymentId, amount) => api.post(`/payments/${paymentId}/refund/`, { amount }),
};

// Debt API
export const debtAPI = {
  getAll: (params = {}) => api.get('/debts/', { params }),
  getById: (id) => api.get(`/debts/${id}/`),
  addPayment: (id, paymentData) => api.post(`/debts/${id}/payments/`, paymentData),
  getByCustomer: (customerId) => api.get(`/customers/${customerId}/debts/`),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications/'),
  getUnread: () => api.get('/notifications/unread/'),
  markAsRead: (id) => api.post(`/notifications/${id}/mark-read/`),
  markAllAsRead: () => api.post('/notifications/mark-all-read/'),
  getSettings: () => api.get('/notifications/settings/'),
  updateSettings: (settings) => api.put('/notifications/settings/', settings),
  delete: (id) => api.delete(`/notifications/${id}/`), // Added DELETE
};

// Audit Log API
export const auditLogAPI = {
  getAll: (params = {}) => api.get('/audit-log/', { params }),
  getById: (id) => api.get(`/audit-log/${id}/`),
  getByModel: (modelName) => api.get(`/audit-log/model/${modelName}/`),
  getByUser: (userId) => api.get(`/audit-log/user/${userId}/`),
};

// Dashboard API
export const dashboardAPI = {
  getKPIs: () => api.get('/dashboard/kpis/'),
  getSalesData: (period = 'monthly') => api.get(`/dashboard/sales/?period=${period}`),
  getTopProducts: (limit = 5) => api.get(`/dashboard/top-products/?limit=${limit}`),
  getLowStockAlerts: () => api.get('/dashboard/low-stock/'),
  getRecentActivity: (limit = 10) => api.get(`/dashboard/recent-activity/?limit=${limit}`),
};

// Barcode API
export const barcodeAPI = {
  scan: (barcodeData) => api.post('/barcode/scan/', barcodeData),
  associate: (productId, barcode) => api.post(`/products/${productId}/barcode/`, { barcode }),
  lookup: (barcode) => api.get(`/barcode/lookup/${barcode}/`),
};

// Export API

export const exportAPI = {
  products: (format = 'excel') => api.get(`/export/products/`, { 
    params: { format },
    responseType: 'blob'
  }),
  orders: (format = 'excel') => api.get(`/export/orders/`, { 
    params: { format },
    responseType: 'blob'
  }),
  inventory: (format = 'excel') => api.get(`/export/inventory/`, { 
    params: { format },
    responseType: 'blob'
  }),
  customers: (format = 'excel') => api.get(`/export/customers/`, { 
    params: { format },
    responseType: 'blob'
  }),
};

// Reports API
export const reportsAPI = {
  sales: (startDate, endDate) => api.get('/reports/sales/', { params: { start_date: startDate, end_date: endDate } }),
  inventory: () => api.get('/reports/inventory/'),
  customers: () => api.get('/reports/customers/'),
  debts: () => api.get('/reports/debts/'),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings/'),
  update: (settingsData) => api.put('/settings/', settingsData),
  getStoreInfo: () => api.get('/settings/store-info/'),
  updateStoreInfo: (storeData) => api.put('/settings/store-info/', storeData),
  getTaxSettings: () => api.get('/settings/tax/'),
  updateTaxSettings: (taxData) => api.put('/settings/tax/', taxData),
};

// Help & Support API
export const helpAPI = {
  getTips: (pageUrl) => api.get('/help/tips/', { params: { page_url: pageUrl } }),
  getDocumentation: () => api.get('/help/documentation/'),
  contactSupport: (message) => api.post('/help/contact/', message),
  getFAQs: () => api.get('/help/faqs/'),
};

export const expenseAPI = {
  getAll: () => api.get('/expenses/'),
  getById: (id) => api.get(`/expenses/${id}/`),
  create: (expenseData) => api.post('/expenses/add/', expenseData),
  update: (id, expenseData) => api.put(`/expenses/${id}/edit/`, expenseData),
  delete: (id) => api.delete(`/expenses/${id}/delete/`),
};

// Utility functions
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Bad request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Requested resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.message || 'An unexpected error occurred.';
    }
  } else if (error.request) {
    // Request made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred.';
  }
};

// Add to your existing api.jsx

// Balance Transaction API
export const balanceTransactionAPI = {
  getByCustomer: (customerId) => api.get(`/customers/${customerId}/balance-transactions/`),
  getAll: (params = {}) => api.get('/balance-transactions/', { params }),
  create: (customerId, transactionData) => api.post(`/customers/${customerId}/balance-transactions/`, transactionData),
};

// Barcode Scan API
export const barcodeScanAPI = {
  getAll: (params = {}) => api.get('/barcode-scans/', { params }),
  getByProduct: (productId) => api.get(`/products/${productId}/barcode-scans/`),
  create: (scanData) => api.post('/barcode-scans/', scanData),
};

// Debt API (enhanced)
export const debtAPI = {
  getAll: (params = {}) => api.get('/debts/', { params }),
  getById: (id) => api.get(`/debts/${id}/`),
  getByCustomer: (customerId) => api.get(`/customers/${customerId}/debts/`),
  createPayment: (debtId, paymentData) => api.post(`/debts/${debtId}/payments/`, paymentData),
  sendReminder: (debtId) => api.post(`/debts/${debtId}/send-reminder/`),
};

// Discount API
export const discountAPI = {
  getAll: (params = {}) => api.get('/discounts/', { params }),
  getById: (id) => api.get(`/discounts/${id}/`),
  create: (discountData) => api.post('/discounts/', discountData),
  update: (id, discountData) => api.put(`/discounts/${id}/`, discountData),
  delete: (id) => api.delete(`/discounts/${id}/`),
  validate: (code, orderData) => api.post('/discounts/validate/', { code, ...orderData }),
};

// Expense API (enhanced)
export const expenseAPI = {
  getAll: (params = {}) => api.get('/expenses/', { params }),
  getById: (id) => api.get(`/expenses/${id}/`),
  create: (expenseData) => api.post('/expenses/', expenseData),
  update: (id, expenseData) => api.put(`/expenses/${id}/`, expenseData),
  delete: (id) => api.delete(`/expenses/${id}/`),
  getCategories: () => api.get('/expenses/categories/'),
  getSummary: (startDate, endDate) => api.get('/expenses/summary/', { 
    params: { start_date: startDate, end_date: endDate } 
  }),
};

// Help Tip API
export const helpTipAPI = {
  getAll: (params = {}) => api.get('/help-tips/', { params }),
  getById: (id) => api.get(`/help-tips/${id}/`),
  getByPage: (pageUrl) => api.get(`/help-tips/page/${encodeURIComponent(pageUrl)}/`),
  create: (tipData) => api.post('/help-tips/', tipData),
  update: (id, tipData) => api.put(`/help-tips/${id}/`, tipData),
  delete: (id) => api.delete(`/help-tips/${id}/`),
};

// Inventory History API
export const inventoryHistoryAPI = {
  getAll: (params = {}) => api.get('/inventory-history/', { params }),
  getByProduct: (productId) => api.get(`/products/${productId}/inventory-history/`),
  getByInventory: (inventoryId) => api.get(`/inventory/${inventoryId}/history/`),
};

// Return API
export const returnAPI = {
  getAll: (params = {}) => api.get('/returns/', { params }),
  getById: (id) => api.get(`/returns/${id}/`),
  create: (returnData) => api.post('/returns/', returnData),
  update: (id, returnData) => api.put(`/returns/${id}/`, returnData),
  process: (id, processingData) => api.post(`/returns/${id}/process/`, processingData),
  getReasons: () => api.get('/returns/reasons/'),
};

// Tax Rate API
export const taxRateAPI = {
  getAll: (params = {}) => api.get('/tax-rates/', { params }),
  getById: (id) => api.get(`/tax-rates/${id}/`),
  create: (taxData) => api.post('/tax-rates/', taxData),
  update: (id, taxData) => api.put(`/tax-rates/${id}/`, taxData),
  delete: (id) => api.delete(`/tax-rates/${id}/`),
  calculate: (orderData) => api.post('/tax-rates/calculate/', orderData),
};

export default api;
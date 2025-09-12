// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './components/Products/ProductList';
import ProductDetail from './components/Products/ProductDetail';
import InventoryManagement from './components/Inventory/InventoryManagement';
import OrderList from './components/Orders/OrderList';
import OrderDetail from './components/Orders/OrderDetail';
import Cart from './components/Orders/Cart';
import CustomerList from './components/Customers/CustomerList';
import CustomerDetail from './components/Customers/CustomerDetail';
import PaymentList from './components/Payments/PaymentList';
import ExpenseList from './components/Expenses/ExpenseList';
import DebtList from './components/Debts/DebtList';
import SupplierList from './components/Suppliers/SupplierList';
import CategoryManager from './components/Categories/CategoryManager';
import NotificationCenter from './components/Notifications/NotificationCenter';
import AuditLogs from './components/Audit/AuditLogs';
import HelpTips from './components/Help/HelpTips';
import Reports from './components/Reports/Reports';
import Login from './components/Auth/Login';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';


// New missing components
import ActivityFeed from './components/Audit/ActivityFeed';
import ScanHistory from './components/Barcode/ScanHistory';
import CategoryTree from './components/Categories/CategoryTree';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';
import SearchBar from './components/Common/SearchBar';
import CustomerForm from './components/Customers/CustomerForm';
import KPICards from './components/Dashboard/KPICards';
import DebtManagement from './components/Debts/DebtManagement';
import DiscountForm from './components/Discounts/DiscountForm';
import ExpenseForm from './components/Expenses/ExpenseForm';
import Documentation from './components/Help/Documentation';
import Tooltips from './components/Help/Tooltips';
import LowStockAlerts from './components/Inventory/LowStockAlerts';
import StockAdjustment from './components/Inventory/StockAdjustment';
import NotificationDropdown from './components/Notifications/NotificationDropdown';
import Checkout from './components/Orders/Checkout';
import OrderStatusKanban from './components/Orders/OrderStatusKanban';
import ProductBulkActions from './components/Products/ProductBulkActions';
import ProductForm from './components/Products/ProductForm';
import ProductFilters from './components/Products/ProductFilters';
import ReturnProcessing from './components/Returns/ReturnProcessing';
import SupplierForm from './components/Suppliers/SupplierForm';
import PaymentProcessing from './components/Payments/PaymentProcessing';
import PaymentMethods from './components/Payments/PaymentMethods';

function AppContent() {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="d-flex">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Navbar />
        <div className="container-fluid py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/payments" element={<PaymentList />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/debts" element={<DebtList />} />
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/categories" element={<CategoryManager />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/help" element={<HelpTips />} />
            <Route path="/reports" element={<Reports />} />

            <Route path="/products" element={<ProductList />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/low-stock" element={<LowStockAlerts />} />
              <Route path="/orders" element={<OrderList />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-kanban" element={<OrderStatusKanban />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />
              <Route path="/payments" element={<PaymentList />} />
              <Route path="/payment-processing" element={<PaymentProcessing />} />
              <Route path="/payment-methods" element={<PaymentMethods />} />
              <Route path="/expenses" element={<ExpenseList />} />
              <Route path="/expenses/new" element={<ExpenseForm />} />
              <Route path="/debts" element={<DebtList />} />
              <Route path="/debt-management" element={<DebtManagement />} />
              <Route path="/suppliers" element={<SupplierList />} />
              <Route path="/suppliers/new" element={<SupplierForm />} />
              <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
              <Route path="/categories" element={<CategoryManager />} />
              <Route path="/category-tree" element={<CategoryTree />} />
              <Route path="/discounts" element={<DiscountList />} />
              <Route path="/discounts/new" element={<DiscountForm />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/return-processing" element={<ReturnProcessing />} />
              <Route path="/taxes" element={<TaxManager />} />
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/activity-feed" element={<ActivityFeed />} />
              <Route path="/help-tips" element={<HelpTips />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/tooltips" element={<Tooltips />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/advanced-reports" element={<AdvancedReports />} />
              <Route path="/barcode-scanner" element={<BarcodeScanner />} />
              <Route path="/scan-history" element={<ScanHistory />} />

          </Routes>
        </div>
      </div>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <SettingsProvider>
              <AppContent />
            </SettingsProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
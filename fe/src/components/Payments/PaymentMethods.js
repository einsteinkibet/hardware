// src/components/Payments/PaymentMethods.js
import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState({
    cash: { enabled: true, processing_fee: 0 },
    card: { enabled: true, processing_fee: 2.5 },
    bank: { enabled: true, processing_fee: 1.0 },
    credit: { enabled: true, processing_fee: 0 },
    mpesa: { enabled: true, processing_fee: 1.5 }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const response = await settingsAPI.get();
      if (response.data.payment_methods) {
        setPaymentMethods(response.data.payment_methods);
      }
    } catch (error) {
      console.error('Failed to fetch payment settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsAPI.update({ payment_methods: paymentMethods });
      toast.success('Payment methods updated successfully');
    } catch (error) {
      toast.error('Failed to update payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (method, field, value) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: field === 'processing_fee' ? parseFloat(value) || 0 : value
      }
    }));
  };

  const formatMethodName = (method) => {
    const names = {
      cash: 'Cash',
      card: 'Credit Card',
      bank: 'Bank Transfer',
      credit: 'Store Credit',
      mpesa: 'M-Pesa'
    };
    return names[method] || method;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Payment Methods</h1>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row">
            {Object.entries(paymentMethods).map(([method, config]) => (
              <div key={method} className="col-md-6 col-lg-4 mb-4">
                <div className="card">
                  <div className="card-body">
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => handleMethodChange(method, 'enabled', e.target.checked)}
                        style={{ transform: 'scale(1.5)' }}
                      />
                      <label className="form-check-label fs-5 fw-bold">
                        {formatMethodName(method)}
                      </label>
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Processing Fee (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        className="form-control"
                        value={config.processing_fee}
                        onChange={(e) => handleMethodChange(method, 'processing_fee', e.target.value)}
                        disabled={!config.enabled}
                      />
                    </div>

                    <div className="form-text">
                      {config.enabled ? (
                        <span className="text-success">
                          <i className="fas fa-check-circle me-1"></i>
                          Enabled
                        </span>
                      ) : (
                        <span className="text-danger">
                          <i className="fas fa-times-circle me-1"></i>
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">Payment Method Instructions</h5>
          <div className="row">
            <div className="col-md-6">
              <h6>Cash Payments</h6>
              <ul className="list-unstyled">
                <li><i className="fas fa-check text-success me-2"></i>No processing fees</li>
                <li><i className="fas fa-check text-success me-2"></i>Instant confirmation</li>
                <li><i className="fas fa-check text-success me-2"></i>Requires manual reconciliation</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>Card Payments</h6>
              <ul className="list-unstyled">
                <li><i className="fas fa-check text-success me-2"></i>2.5% standard processing fee</li>
                <li><i className="fas fa-check text-success me-2"></i>Instant verification</li>
                <li><i className="fas fa-check text-success me-2"></i>Secure PCI-compliant processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
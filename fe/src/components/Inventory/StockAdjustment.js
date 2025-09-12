// src/components/Inventory/StockAdjustment.js
import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';
import { INVENTORY_ACTIONS } from '../../utils/constants';

const StockAdjustment = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    reason: '',
    action_type: INVENTORY_ACTIONS.ADJUSTMENT
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inventoryAPI.adjust(product.inventory.id, {
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        action_type: formData.action_type
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to adjust stock:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Adjust Stock - {product.name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Action Type</label>
                <select
                  className="form-select"
                  value={formData.action_type}
                  onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                  required
                >
                  <option value={INVENTORY_ACTIONS.ADJUSTMENT}>Adjustment</option>
                  <option value={INVENTORY_ACTIONS.RESTOCK}>Restock</option>
                  <option value={INVENTORY_ACTIONS.DAMAGE}>Damage</option>
                  <option value={INVENTORY_ACTIONS.RETURN}>Return</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Reason</label>
                <textarea
                  className="form-control"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adjusting...' : 'Adjust Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;
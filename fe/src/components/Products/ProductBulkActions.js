// src/components/Products/ProductBulkActions.js
import React, { useState } from 'react';
import { productAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ProductBulkActions = ({ selectedCount, selectedIds, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');
  const [actionData, setActionData] = useState({});

  const handleBulkAction = async () => {
    if (!action || selectedCount === 0) return;

    setLoading(true);
    try {
      switch (action) {
        case 'activate':
          await productAPI.bulkUpdate(selectedIds, { is_active: true });
          toast.success(`${selectedCount} products activated`);
          break;
        case 'deactivate':
          await productAPI.bulkUpdate(selectedIds, { is_active: false });
          toast.success(`${selectedCount} products deactivated`);
          break;
        case 'update_tags':
          // Implement tag update logic
          break;
        case 'update_pricing':
          // Implement pricing update logic
          break;
        default:
          break;
      }
      setAction('');
      setActionData({});
      onActionComplete();
    } catch (error) {
      toast.error('Bulk action failed');
    } finally {
      setLoading(false);
    }
  };

  const bulkActions = [
    { value: 'activate', label: 'Activate Products', icon: 'fas fa-check' },
    { value: 'deactivate', label: 'Deactivate Products', icon: 'fas fa-times' },
    { value: 'update_tags', label: 'Update Tags', icon: 'fas fa-tags' },
    { value: 'update_pricing', label: 'Update Pricing', icon: 'fas fa-dollar-sign' }
  ];

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong>{selectedCount} products selected</strong>
          </div>
          
          <div className="d-flex gap-2">
            <select
              className="form-select"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              disabled={loading}
              style={{ width: '200px' }}
            >
              <option value="">Choose action...</option>
              {bulkActions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {action && (
              <button
                className="btn btn-primary"
                onClick={handleBulkAction}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Applying...
                  </>
                ) : (
                  'Apply'
                )}
              </button>
            )}

            <button
              className="btn btn-outline-secondary"
              onClick={() => onActionComplete()}
            >
              Clear Selection
            </button>
          </div>
        </div>

        {/* Action-specific forms can be added here */}
        {action === 'update_tags' && (
          <div className="mt-3 p-3 border rounded">
            <h6>Update Tags</h6>
            <p className="text-muted">Tag update functionality coming soon...</p>
          </div>
        )}

        {action === 'update_pricing' && (
          <div className="mt-3 p-3 border rounded">
            <h6>Update Pricing</h6>
            <p className="text-muted">Pricing update functionality coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductBulkActions;
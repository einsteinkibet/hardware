// src/components/Help/HelpTips.js
import React, { useState, useEffect } from 'react';
import { helpTipAPI } from '../../services/api';

const HelpTips = () => {
  const [helpTips, setHelpTips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    page_url: '',
    order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchHelpTips();
  }, []);

  const fetchHelpTips = async () => {
    try {
      const response = await helpTipAPI.getAll();
      setHelpTips(response.data);
    } catch (error) {
      console.error('Failed to fetch help tips:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await helpTipAPI.create(formData);
      setShowForm(false);
      setFormData({ title: '', content: '', page_url: '', order: 0, is_active: true });
      fetchHelpTips();
    } catch (error) {
      console.error('Failed to create help tip:', error);
    }
  };

  const toggleTipStatus = async (tipId, currentStatus) => {
    try {
      await helpTipAPI.update(tipId, { is_active: !currentStatus });
      fetchHelpTips();
    } catch (error) {
      console.error('Failed to update help tip status:', error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Help Tips Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus me-2"></i>Add Help Tip
        </button>
      </div>

      {/* Help Tips Accordion */}
      <div className="accordion" id="helpTipsAccordion">
        {helpTips.map((tip, index) => (
          <div key={tip.id} className="accordion-item">
            <h2 className="accordion-header" id={`heading-${tip.id}`}>
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-${tip.id}`}
                aria-expanded="false"
                aria-controls={`collapse-${tip.id}`}
              >
                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                  <span>
                    {tip.title}
                    <span className="badge bg-secondary ms-2">{tip.page_url}</span>
                  </span>
                  <span className={`badge ${tip.is_active ? 'bg-success' : 'bg-secondary'}`}>
                    {tip.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </button>
            </h2>
            <div
              id={`collapse-${tip.id}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading-${tip.id}`}
              data-bs-parent="#helpTipsAccordion"
            >
              <div className="accordion-body">
                <div dangerouslySetInnerHTML={{ __html: tip.content }} />
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <small className="text-muted">Order: {tip.order}</small>
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => toggleTipStatus(tip.id, tip.is_active)}
                    >
                      {tip.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Help Tip Modal */}
      {showForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Help Tip</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Page URL *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.page_url}
                      onChange={(e) => setFormData({ ...formData, page_url: e.target.value })}
                      placeholder="/products, /orders, etc."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Content *</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Order</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check mt-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                        <label className="form-check-label">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Create Help Tip</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpTips;
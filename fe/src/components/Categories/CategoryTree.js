// src/components/Categories/CategoryTree.js
import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const CategoryTree = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (categories, parentId = null) => {
    return categories
      .filter(category => category.parent === parentId)
      .map(category => ({
        ...category,
        children: buildTree(categories, category.id)
      }));
  };

  const renderTree = (nodes, level = 0) => {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
          <div>
            <strong>{node.name}</strong>
            {node.description && (
              <small className="text-muted d-block">{node.description}</small>
            )}
          </div>
          <div>
            <span className={`badge ${node.is_active ? 'bg-success' : 'bg-secondary'} me-2`}>
              {node.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className="badge bg-info">
              {node.products_count || 0} Products
            </span>
          </div>
        </div>
        {node.children && renderTree(node.children, level + 1)}
      </div>
    ));
  };

  if (loading) {
    return <LoadingSpinner text="Loading category tree..." />;
  }

  const treeData = buildTree(categories);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Category Tree View</h1>
        <button className="btn btn-primary" onClick={fetchCategories}>
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {treeData.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
              <p className="text-muted">No categories found</p>
            </div>
          ) : (
            renderTree(treeData)
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryTree;
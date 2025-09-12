// src/components/Common/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  return (
    <div className="d-flex justify-content-center align-items-center py-4">
      <div className={`spinner-border text-primary ${sizeClass[size]}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <span className="ms-2">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
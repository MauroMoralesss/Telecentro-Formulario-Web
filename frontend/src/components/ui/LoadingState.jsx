import React from 'react';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

export const LoadingState = ({ 
  isLoading, 
  error, 
  children,
  loadingMessage = "Cargando...",
  errorMessage = "Ha ocurrido un error"
}) => {
  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FaExclamationTriangle className="error-icon" />
        <p>{error}</p>
      </div>
    );
  }

  return children;
}; 
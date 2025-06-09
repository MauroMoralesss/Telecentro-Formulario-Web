import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import '../styles/loading-spinner.css';

export const LoadingSpinner = ({ 
  message = "Cargando...", 
  size = "medium",
  fullScreen = false 
}) => {
  return (
    <div className={`loading-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="loading-content">
        <div className={`spinner-container ${size}`}>
          <FaSpinner className="spinner" />
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}; 
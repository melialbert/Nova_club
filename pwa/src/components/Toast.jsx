import { useState, useEffect } from 'react';

const toastContainer = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  maxWidth: '400px',
};

const toastStyle = {
  padding: '16px 20px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  animation: 'slideIn 0.3s ease-out',
  minWidth: '300px',
  maxWidth: '400px',
};

const toastSuccess = {
  ...toastStyle,
  backgroundColor: '#4caf50',
  color: 'white',
};

const toastError = {
  ...toastStyle,
  backgroundColor: '#f44336',
  color: 'white',
};

const toastInfo = {
  ...toastStyle,
  backgroundColor: '#2196f3',
  color: 'white',
};

const toastWarning = {
  ...toastStyle,
  backgroundColor: '#ff9800',
  color: 'white',
};

const iconStyle = {
  fontSize: '24px',
  flexShrink: 0,
};

const messageStyle = {
  flex: 1,
  fontSize: '14px',
  lineHeight: '1.4',
};

const closeButton = {
  background: 'transparent',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontSize: '20px',
  padding: '0',
  lineHeight: '1',
  opacity: 0.8,
  transition: 'opacity 0.2s',
};

export function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyle = () => {
    switch (type) {
      case 'success':
        return toastSuccess;
      case 'error':
        return toastError;
      case 'warning':
        return toastWarning;
      default:
        return toastInfo;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  return (
    <div style={getStyle()}>
      <div style={iconStyle}>{getIcon()}</div>
      <div style={messageStyle}>{message}</div>
      <button
        style={closeButton}
        onClick={handleClose}
        onMouseEnter={(e) => (e.target.style.opacity = '1')}
        onMouseLeave={(e) => (e.target.style.opacity = '0.8')}
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div style={toastContainer}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

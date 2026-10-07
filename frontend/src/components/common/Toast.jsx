import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../redux/slices/uiSlice';
import { Icon } from '../icons/Icons';

const ToastItem = ({ toast, onClose }) => {
  useEffect(() => {
    // Automatically dismiss toast after 6 seconds
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 6000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const iconName =
    toast.type === 'success'
      ? 'check'
      : toast.type === 'error'
      ? 'alert'
      : 'sparkles';

  return (
    <div className={`toast toast-${toast.type || 'info'}`}>
      <Icon name={iconName} size={20} className="flex-shrink-0" />
      <div className="flex-1">
        {toast.title && <div className="font-bold text-sm">{toast.title}</div>}
        <div>{toast.message}</div>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-muted hover:text-white"
        style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 2 }}
        title="Close"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const toasts = useSelector((state) => state.ui.toasts);
  const dispatch = useDispatch();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={(id) => dispatch(removeToast(id))}
        />
      ))}
    </div>
  );
};

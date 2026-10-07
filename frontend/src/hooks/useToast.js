import { useDispatch } from 'react-redux';
import { addToast, removeToast } from '../redux/slices/uiSlice';

export const useToast = () => {
  const dispatch = useDispatch();

  const showToast = (message, type = 'info', title = '', duration = 4000) => {
    const id = Date.now() + Math.random();
    dispatch(addToast({ id, message, type, title }));

    if (duration > 0) {
      setTimeout(() => {
        dispatch(removeToast(id));
      }, duration);
    }
  };

  return {
    showToast,
    showSuccess: (msg, title = 'Success') => showToast(msg, 'success', title),
    showError: (msg, title = 'Error') => showToast(msg, 'error', title, 5000),
    showInfo: (msg, title = 'Notice') => showToast(msg, 'info', title),
  };
};

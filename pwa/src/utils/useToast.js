import { useToastStore } from './store';

export function useToast() {
  const toasts = useToastStore((state) => state.toasts);
  const addToast = useToastStore((state) => state.addToast);
  const removeToast = useToastStore((state) => state.removeToast);

  const success = (message, duration) => {
    addToast(message, 'success', duration);
  };

  const error = (message, duration) => {
    addToast(message, 'error', duration);
  };

  const info = (message, duration) => {
    addToast(message, 'info', duration);
  };

  const warning = (message, duration) => {
    addToast(message, 'warning', duration);
  };

  return {
    toasts,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}

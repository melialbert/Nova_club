import { useToastStore } from './store';

export function useToast() {
  const { addToast } = useToastStore();

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
    success,
    error,
    info,
    warning,
  };
}

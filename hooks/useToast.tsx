import React, { useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/common/Toast';

interface ToastState {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastId = 0;

interface UseToastReturn {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  ToastContainer: React.ComponentType;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration?: number
  ) => {
    const id = `toast-${toastId++}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const ToastContainer: React.FC = useCallback(() => (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </>
  ), [toasts, dismissToast]) as React.FC;

  return {
    showToast,
    success,
    error,
    info,
    warning,
    ToastContainer,
  };
};

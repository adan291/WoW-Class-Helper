/**
 * Toast Container Component
 * Displays toast notifications
 */

import React, { useState, useEffect } from 'react';
import { toastService, type Toast } from '../services/toastService.ts';
import '../styles/animations.css';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Subscribe to toast changes
    const unsubscribe = toastService.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-900/90',
          border: 'border-green-500',
          text: 'text-green-100',
          icon: '✅',
        };
      case 'error':
        return {
          bg: 'bg-red-900/90',
          border: 'border-red-500',
          text: 'text-red-100',
          icon: '❌',
        };
      case 'warning':
        return {
          bg: 'bg-amber-900/90',
          border: 'border-amber-500',
          text: 'text-amber-100',
          icon: '⚠️',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-900/90',
          border: 'border-blue-500',
          text: 'text-blue-100',
          icon: 'ℹ️',
        };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => {
        const styles = getToastStyles(toast.type);
        return (
          <div
            key={toast.id}
            className={`${styles.bg} ${styles.border} ${styles.text} border rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right pointer-events-auto`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{styles.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      toastService.dismiss(toast.id);
                    }}
                    className="text-xs font-bold px-2 py-1 rounded hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {toast.action.label}
                  </button>
                )}
                <button
                  onClick={() => toastService.dismiss(toast.id)}
                  className="text-lg leading-none hover:opacity-70 transition-opacity"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(ToastContainer);

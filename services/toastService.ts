/**
 * Toast Notification Service
 * Manages toast notifications for user feedback
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // in milliseconds, 0 = no auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}

type ToastListener = (toasts: Toast[]) => void;

class ToastService {
  private toasts: Toast[] = [];
  private listeners: Set<ToastListener> = new Set();
  private nextId = 0;

  /**
   * Subscribe to toast changes
   */
  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of toast changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  /**
   * Show a success toast
   */
  success(message: string, duration = 3000): string {
    return this.show('success', message, duration);
  }

  /**
   * Show an error toast
   */
  error(message: string, duration = 5000): string {
    return this.show('error', message, duration);
  }

  /**
   * Show an info toast
   */
  info(message: string, duration = 3000): string {
    return this.show('info', message, duration);
  }

  /**
   * Show a warning toast
   */
  warning(message: string, duration = 4000): string {
    return this.show('warning', message, duration);
  }

  /**
   * Show a toast with custom options
   */
  show(
    type: ToastType,
    message: string,
    duration = 3000,
    action?: { label: string; onClick: () => void }
  ): string {
    const id = `toast_${this.nextId++}`;
    const toast: Toast = {
      id,
      type,
      message,
      duration,
      action,
    };

    this.toasts.push(toast);
    this.notifyListeners();

    // Auto-dismiss if duration is set
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  /**
   * Dismiss a specific toast
   */
  dismiss(id: string): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notifyListeners();
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    this.toasts = [];
    this.notifyListeners();
  }

  /**
   * Get all current toasts
   */
  getToasts(): Toast[] {
    return [...this.toasts];
  }
}

// Create singleton instance
export const toastService = new ToastService();

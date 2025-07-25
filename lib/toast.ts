// Toast notification utility for admin panel
export interface ToastOptions {
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

class ToastManager {
  private toasts: Array<{
    id: string;
    title: string;
    description: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
    timestamp: number;
  }> = [];

  private listeners: Array<(toasts: typeof this.toasts) => void> = [];

  show(options: ToastOptions) {
    const toast = {
      id: Math.random().toString(36).substr(2, 9),
      title: options.title || '',
      description: options.description || '',
      type: options.type || 'info',
      duration: options.duration || 5000,
      timestamp: Date.now()
    };

    this.toasts.push(toast);
    this.notifyListeners();

    // Auto remove after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, toast.duration);
    }

    return toast.id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  clear() {
    this.toasts = [];
    this.notifyListeners();
  }

  subscribe(listener: (toasts: typeof this.toasts) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  // Convenience methods
  success(title: string, description?: string) {
    return this.show({ title, description, type: 'success' });
  }

  error(title: string, description?: string) {
    return this.show({ title, description, type: 'error', duration: 7000 });
  }

  warning(title: string, description?: string) {
    return this.show({ title, description, type: 'warning' });
  }

  info(title: string, description?: string) {
    return this.show({ title, description, type: 'info' });
  }
}

export const toast = new ToastManager();

// Helper function to handle API errors
export const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  console.error('API Error:', error);
  
  let title = 'Error';
  let description = defaultMessage;
  
  if (error.message) {
    description = error.message;
  } else if (error.response?.data?.message) {
    description = error.response.data.message;
  } else if (error.response?.data?.errors?.length > 0) {
    const firstError = error.response.data.errors[0];
    if (typeof firstError === 'string') {
      description = firstError;
    } else if (firstError.message) {
      description = firstError.message;
      if (firstError.field) {
        title = `Error in ${firstError.field}`;
      }
    }
  }
  
  toast.error(title, description);
};

// Helper function to handle API success
export const handleApiSuccess = (message: string, description?: string) => {
  toast.success(message, description);
};

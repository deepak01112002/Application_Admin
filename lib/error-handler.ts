'use client';

// Custom error handler to prevent React error overlay crashes
export class ErrorHandler {
  static handleError(error: any, context?: string) {
    // Prevent undefined stack trace parsing errors
    if (error && typeof error === 'object') {
      // Ensure error has a proper stack trace
      if (!error.stack || error.stack === 'undefined') {
        error.stack = `Error: ${error.message || 'Unknown error'}\n    at ${context || 'unknown location'}`;
      }
      
      // Ensure error has a proper message
      if (!error.message) {
        error.message = 'An unexpected error occurred';
      }
    }
    
    // Log the error for debugging
    console.error(`[ErrorHandler] ${context || 'Unknown context'}:`, error);
    
    return error;
  }
  
  static wrapAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: string
  ): T {
    return (async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        throw this.handleError(error, context);
      }
    }) as T;
  }
  
  static wrapFunction<T extends (...args: any[]) => any>(
    fn: T,
    context?: string
  ): T {
    return ((...args: any[]) => {
      try {
        return fn(...args);
      } catch (error) {
        throw this.handleError(error, context);
      }
    }) as T;
  }
  
  static safeExecute<T>(
    fn: () => T,
    fallback: T,
    context?: string
  ): T {
    try {
      return fn();
    } catch (error) {
      this.handleError(error, context);
      return fallback;
    }
  }
  
  static async safeExecuteAsync<T>(
    fn: () => Promise<T>,
    fallback: T,
    context?: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error, context);
      return fallback;
    }
  }
}

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[ErrorHandler] Unhandled promise rejection:', event.reason);
    
    // Prevent the default browser behavior
    event.preventDefault();
    
    // Handle the error
    ErrorHandler.handleError(event.reason, 'Unhandled Promise Rejection');
  });
  
  window.addEventListener('error', (event) => {
    console.error('[ErrorHandler] Global error:', event.error);
    
    // Handle the error
    ErrorHandler.handleError(event.error, 'Global Error Handler');
  });
}

export default ErrorHandler;

'use client';

// Patch for React error overlay stack trace parsing issues
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Override the global error handler to prevent stack trace parsing errors
  const originalConsoleError = console.error;
  
  console.error = (...args: any[]) => {
    // Check if this is a stack trace parsing error
    const errorMessage = args[0];
    if (typeof errorMessage === 'string' && 
        (errorMessage.includes('Cannot read properties of undefined (reading \'split\')') ||
         errorMessage.includes('stack-trace-parser') ||
         errorMessage.includes('parseStack'))) {
      
      // Log a cleaner error message instead
      originalConsoleError('[Dev Error Patch] Stack trace parsing error suppressed:', {
        message: 'React error overlay encountered a parsing issue',
        originalArgs: args,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // For all other errors, use the original console.error
    originalConsoleError(...args);
  };
  
  // Patch window.onerror to handle global errors
  const originalOnError = window.onerror;
  
  window.onerror = (message, source, lineno, colno, error) => {
    if (typeof message === 'string' && 
        (message.includes('Cannot read properties of undefined (reading \'split\')') ||
         message.includes('stack-trace-parser'))) {
      
      console.log('[Dev Error Patch] Global error suppressed:', {
        message: 'Stack trace parsing error prevented',
        source,
        line: lineno,
        column: colno,
        timestamp: new Date().toISOString()
      });
      
      return true; // Prevent default error handling
    }
    
    // For all other errors, use the original handler
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    
    return false;
  };
  
  // Patch unhandled promise rejections
  const originalUnhandledRejection = window.onunhandledrejection;
  
  window.onunhandledrejection = (event) => {
    const reason = event.reason;
    
    if (reason && typeof reason === 'object' && reason.message &&
        (reason.message.includes('Cannot read properties of undefined (reading \'split\')') ||
         reason.message.includes('stack-trace-parser'))) {
      
      console.log('[Dev Error Patch] Unhandled rejection suppressed:', {
        message: 'Stack trace parsing error prevented',
        reason: reason.message,
        timestamp: new Date().toISOString()
      });
      
      event.preventDefault();
      return;
    }
    
    // For all other rejections, use the original handler
    if (originalUnhandledRejection) {
      return originalUnhandledRejection(event);
    }
  };
  
  console.log('[Dev Error Patch] React error overlay patches applied');
}

export {};

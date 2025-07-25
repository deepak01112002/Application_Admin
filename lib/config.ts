// Configuration for Ghanshyam Murti Bhandar Admin Panel
export const config = {
  // Backend URLs
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://server.ghanshyammurtibhandar.com/api',
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://server.ghanshyammurtibhandar.com',
    swaggerUrl: process.env.NEXT_PUBLIC_SWAGGER_URL || 'https://server.ghanshyammurtibhandar.com/api/docs',
  },

  // App Information
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Ghanshyam Murti Bhandar Admin',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NEXT_PUBLIC_ENV || 'production',
  },

  // Admin Credentials (for reference)
  admin: {
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@ghanshyambhandar.com',
    // Note: Password should never be stored in frontend config
  },

  // File Upload Settings
  upload: {
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
  },

  // Pagination Settings
  pagination: {
    defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '10'),
    maxPageSize: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || '100'),
  },

  // Domain Configuration
  domains: {
    main: 'https://ghanshyammurtibhandar.com',
    admin: 'https://admin.ghanshyammurtibhandar.com',
    backend: 'https://server.ghanshyammurtibhandar.com',
  },

  // Feature Flags
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableAdvancedReports: true,
    enableInventoryManagement: true,
    enableSupplierManagement: true,
    enableGSTReports: true,
  },

  // UI Settings
  ui: {
    theme: 'light',
    sidebarCollapsed: false,
    itemsPerPage: 10,
  },

  // API Endpoints (relative to baseUrl)
  endpoints: {
    auth: {
      login: '/auth/login',
      profile: '/auth/profile',
      logout: '/auth/logout',
    },
    products: {
      list: '/products',
      create: '/products',
      update: (id: string) => `/products/${id}`,
      delete: (id: string) => `/products/${id}`,
      inventory: (id: string) => `/products/${id}/inventory`,
    },
    categories: {
      list: '/categories',
      create: '/categories',
      update: (id: string) => `/categories/${id}`,
      delete: (id: string) => `/categories/${id}`,
    },
    orders: {
      list: '/orders/admin/all',
      details: (id: string) => `/orders/${id}`,
      updateStatus: (id: string) => `/orders/admin/${id}/status`,
    },
    users: {
      list: '/admin/management/users',
      details: (id: string) => `/admin/management/users/${id}`,
      update: (id: string) => `/admin/management/users/${id}`,
      delete: (id: string) => `/admin/management/users/${id}`,
      toggleStatus: (id: string) => `/admin/management/users/${id}/toggle-status`,
    },
    dashboard: {
      stats: '/admin/stats',
      quickStats: '/admin/dashboard/quick-stats',
      overview: '/admin/dashboard',
    },
    coupons: {
      list: '/coupons',
      create: '/coupons',
      update: (id: string) => `/coupons/${id}`,
      delete: (id: string) => `/coupons/${id}`,
      validate: '/coupons/validate',
    },
    reports: {
      sales: '/reports/sales',
      inventory: '/reports/inventory',
      customers: '/reports/customers',
      financial: '/reports/financial',
    },
    settings: {
      business: '/admin/business-settings',
      system: '/settings',
      gst: '/gst/config',
    },
    inventory: {
      dashboard: '/inventory/dashboard',
      list: '/inventory',
      updateStock: (id: string) => `/inventory/${id}/stock`,
      alerts: '/inventory/alerts',
    },
    suppliers: {
      list: '/suppliers',
      create: '/suppliers',
      update: (id: string) => `/suppliers/${id}`,
      delete: (id: string) => `/suppliers/${id}`,
    },
    invoices: {
      list: '/invoices',
      details: (id: string) => `/invoices/${id}`,
      generate: (orderId: string) => `/invoices/generate/${orderId}`,
      download: (id: string) => `/invoices/${id}/download`,
    },
    support: {
      dashboard: '/support/admin/dashboard',
      tickets: '/support/admin/tickets',
      assign: (id: string) => `/support/admin/tickets/${id}/assign`,
      resolve: (id: string) => `/support/admin/tickets/${id}/resolve`,
    },
    returns: {
      list: '/returns/admin/all',
      approve: (id: string) => `/returns/${id}/approve`,
      reject: (id: string) => `/returns/${id}/reject`,
      statistics: '/returns/admin/statistics',
    },
  },
};

// Helper functions
export const getApiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint}`;
};

export const isProduction = (): boolean => {
  return config.app.environment === 'production';
};

export const isDevelopment = (): boolean => {
  return config.app.environment === 'development';
};

// Export individual configs for convenience
export const { api, app, admin, upload, pagination, domains, features, ui, endpoints } = config;

export default config;

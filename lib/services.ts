import { api } from './api';

// Helper function to extract data from standardized API response
const extractData = (response: any) => {
  if (response.success) {
    return response.data;
  } else {
    throw new Error(response.message || 'API request failed');
  }
};

// Types
export interface User {
  _id: string;
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

// Customer is the same as User for admin panel
export type Customer = User;

export interface Product {
  id: string;
  _id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  stock: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  _id: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  parent?: {
    _id: string;
    id?: string;
    name: string;
    slug?: string;
  } | null;
  product_count: number;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  _id: string;
  orderNumber: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      id: string;
      name: string;
    };
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  userUsageLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  productCount: number;
  categoryCount: number;
  orderCount: number;
  userCount: number;
  totalSales: number;
  monthlyStats: {
    orders: number;
    sales: number;
    newUsers: number;
  };
}

// Auth Service
export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', { email, password });
    const data = extractData(response);

    // Store token after successful login
    if (data.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('authToken', data.token);
      }
    }

    return data;
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get('/auth/profile');
    return extractData(response);
  },

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    const response = await api.put('/auth/profile', data);
    return extractData(response);
  },

  async logout(): Promise<void> {
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
    }
  },

  async checkAuth(): Promise<boolean> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return false;

      // Just check if token exists, don't make API call
      return true;
    } catch (error) {
      // Clear invalid token
      this.logout();
      return false;
    }
  },

  async checkAuthAndGetProfile(): Promise<{ user: User } | null> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return null;

      const profile = await this.getProfile();
      return profile;
    } catch (error) {
      // Clear invalid token
      this.logout();
      return null;
    }
  }
};



// Product Service
export const productService = {
  async getProducts(params?: { page?: number; limit?: number; search?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    const response = await api.get(`/products${query ? `?${query}` : ''}`);
    const data = extractData(response);

    // Backend returns { products: [...], pagination: {...} }
    // Return the full response so frontend can access both products and pagination
    return {
      products: data.products || [],
      pagination: data.pagination || { totalPages: 1, currentPage: 1, total: 0 }
    };
  },

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return extractData(response);
  },

  async createProduct(data: FormData): Promise<Product> {
    const response = await api.post('/products', data);
    return extractData(response);
  },

  async updateProduct(id: string, data: FormData): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return extractData(response);
  },

  async deleteProduct(id: string): Promise<void> {
    const response = await api.delete(`/products/${id}`);
    return extractData(response);
  },

  async updateInventory(id: string, stock: number): Promise<Product> {
    const response = await api.patch(`/products/${id}/inventory`, { stock, operation: 'set' });
    return extractData(response);
  }
};

// Category Service
export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return extractData(response);
  },

  async getCategory(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return extractData(response);
  },

  async createCategory(data: FormData): Promise<Category> {
    const response = await api.post('/categories', data);
    return extractData(response);
  },

  async updateCategory(id: string, data: FormData): Promise<Category> {
    const response = await api.put(`/categories/${id}`, data);
    return extractData(response);
  },

  async deleteCategory(id: string): Promise<void> {
    const response = await api.delete(`/categories/${id}`);
    return extractData(response);
  }
};

// Order Service
export const orderService = {
  async getOrders(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    const response = await api.get(`/orders/admin/all${query ? `?${query}` : ''}`);

    // Handle response format
    const data = extractData(response);

    return {
      orders: data.orders || [],
      pagination: data.pagination || { totalPages: 1, currentPage: 1, total: 0 }
    };
  },

  async getOrder(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return extractData(response);
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const response = await api.patch(`/orders/admin/${id}/status`, { status });
    return extractData(response);
  }
};

// Dashboard Service
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/stats');
    return extractData(response);
  },

  async getRecentOrders(): Promise<Order[]> {
    const response = await api.get('/orders?limit=5');
    return extractData(response);
  }
};

// User Service (Admin Management)
export const userService = {
  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    const response = await api.get(`/admin/management/users${query ? `?${query}` : ''}`);
    const data = extractData(response);

    // Return users array with proper formatting
    return data.users || [];
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/admin/management/users/${id}`);
    const data = extractData(response);
    return data.user || data;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await api.put(`/admin/management/users/${id}`, userData);
    const data = extractData(response);
    return data.user || data;
  },

  async deleteUser(id: string): Promise<void> {
    const response = await api.delete(`/admin/management/users/${id}`);
    return extractData(response);
  },

  async toggleUserStatus(id: string): Promise<User> {
    const response = await api.patch(`/admin/management/users/${id}/toggle-status`);
    const data = extractData(response);
    return data.user || data;
  }
};

// Coupon Service
export const couponService = {
  async getCoupons(params?: { page?: number; limit?: number }): Promise<Coupon[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const response = await api.get(`/coupons${query ? `?${query}` : ''}`);
    return extractData(response);
  },

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const response = await api.post('/coupons', data);
    return extractData(response);
  },

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
    const response = await api.put(`/coupons/${id}`, data);
    return extractData(response);
  },

  async deleteCoupon(id: string): Promise<void> {
    const response = await api.delete(`/coupons/${id}`);
    return extractData(response);
  },

  async validateCoupon(code: string, orderAmount: number, cartItems: any[]): Promise<any> {
    const response = await api.post('/coupons/validate', { code, orderAmount, cartItems });
    return extractData(response);
  }
};

// Admin Dashboard Services
export const adminDashboardService = {
  async getDashboard(period = '30'): Promise<any> {
    const response = await api.get(`/admin/dashboard?period=${period}`);
    return extractData(response);
  },

  async getQuickStats(): Promise<any> {
    const response = await api.get('/admin/dashboard/quick-stats');
    return extractData(response);
  },
};

// Admin Management Services
export const adminManagementService = {
  // User Management
  async getAllUsers(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/admin/management/users${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  async getUserDetails(id: string): Promise<any> {
    const response = await api.get(`/admin/management/users/${id}`);
    return extractData(response);
  },

  async updateUserStatus(id: string, data: any): Promise<any> {
    const response = await api.patch(`/admin/management/users/${id}/status`, data);
    return extractData(response);
  },

  async createAdminUser(data: any): Promise<any> {
    const response = await api.post('/admin/management/users/admin', data);
    return extractData(response);
  },

  // Order Management
  async updateOrderStatus(id: string, data: any): Promise<any> {
    const response = await api.patch(`/admin/management/orders/${id}/status`, data);
    return extractData(response);
  },

  // Product Management
  async toggleProductStatus(id: string): Promise<any> {
    const response = await api.patch(`/admin/management/products/${id}/toggle-status`);
    return extractData(response);
  },

  async updateProductStock(id: string, data: any): Promise<any> {
    const response = await api.patch(`/admin/management/products/${id}/stock`, data);
    return extractData(response);
  },

  // Category Management
  async toggleCategoryStatus(id: string): Promise<any> {
    const response = await api.patch(`/admin/management/categories/${id}/toggle-status`);
    return extractData(response);
  },

  // Coupon Management
  async toggleCouponStatus(id: string): Promise<any> {
    const response = await api.patch(`/admin/management/coupons/${id}/toggle-status`);
    return extractData(response);
  },

  // System Management
  async getSystemOverview(): Promise<any> {
    const response = await api.get('/admin/management/system/overview');
    return extractData(response);
  },

  async toggleMaintenanceMode(data: any): Promise<any> {
    const response = await api.patch('/admin/management/system/maintenance', data);
    return extractData(response);
  },
};

// Business Settings Services
export const businessSettingsService = {
  async getBusinessSettings(): Promise<any> {
    const response = await api.get('/admin/business-settings');
    return extractData(response);
  },

  async updateCompanyInfo(data: any): Promise<any> {
    const response = await api.put('/admin/business-settings/company', data);
    return extractData(response);
  },

  async updateGSTSettings(data: any): Promise<any> {
    const response = await api.put('/admin/business-settings/gst', data);
    return extractData(response);
  },

  async updateOrderSettings(data: any): Promise<any> {
    const response = await api.put('/admin/business-settings/orders', data);
    return extractData(response);
  },

  async updatePaymentSettings(data: any): Promise<any> {
    const response = await api.put('/admin/business-settings/payments', data);
    return extractData(response);
  },

  async updateShippingSettings(data: any): Promise<any> {
    const response = await api.put('/admin/business-settings/shipping', data);
    return extractData(response);
  },

  async updateInventorySettings(data: any): Promise<any> {
    const response = await api.put('/admin/business-settings/inventory', data);
    return extractData(response);
  },

  async updateReturnSettings(data: any): Promise<any> {
    const response = await api.put('/admin/business-settings/returns', data);
    return extractData(response);
  },

  async updateNotificationSettings(data: any): Promise<any> {
    const response = await api.put('/admin/business-settings/notifications', data);
    return extractData(response);
  },

  async updateFeatureFlags(data: any): Promise<any> {
    const response = await api.put('/admin/business-settings/features', data);
    return extractData(response);
  },
};

// System Settings Services
export const systemSettingsService = {
  async getSystemSettings(): Promise<any> {
    const response = await api.get('/settings');
    return extractData(response);
  },

  async validateSettings(): Promise<any> {
    const response = await api.get('/settings/validate');
    return extractData(response);
  },

  async getSystemStatus(): Promise<any> {
    const response = await api.get('/settings/status');
    return extractData(response);
  },

  async exportSettings(): Promise<any> {
    const response = await api.get('/settings/export');
    return response; // This might be a file download
  },

  async importSettings(data: any): Promise<any> {
    const response = await api.post('/settings/import', data);
    return extractData(response);
  },
};

// Advanced Features Services
export const advancedFeaturesService = {
  // Notifications
  async getAllNotifications(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/notifications/admin/all${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  async getNotificationAnalytics(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/notifications/admin/analytics${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  // Returns
  async getAllReturns(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/returns/admin/all${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  async approveReturn(id: string, notes?: string): Promise<any> {
    const response = await api.patch(`/returns/${id}/approve`, { notes });
    return extractData(response);
  },

  async rejectReturn(id: string, reason: string): Promise<any> {
    const response = await api.patch(`/returns/${id}/reject`, { reason });
    return extractData(response);
  },

  async getReturnStatistics(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/returns/admin/statistics${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  // Support
  async getSupportDashboard(): Promise<any> {
    const response = await api.get('/support/admin/dashboard');
    return extractData(response);
  },

  async getAllTickets(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/support/admin/tickets${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  async assignTicket(id: string, assignedTo: string): Promise<any> {
    const response = await api.patch(`/support/admin/tickets/${id}/assign`, { assignedTo });
    return extractData(response);
  },

  async resolveTicket(id: string, notes: string, type = 'solved'): Promise<any> {
    const response = await api.patch(`/support/admin/tickets/${id}/resolve`, { notes, type });
    return extractData(response);
  },

  async getSupportStatistics(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/support/admin/statistics${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },
};

// Inventory Management Services
export const inventoryService = {
  async getInventoryDashboard(): Promise<any> {
    const response = await api.get('/inventory/dashboard');
    return extractData(response);
  },

  async getAllInventory(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/inventory${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  async updateStock(productId: string, data: any): Promise<any> {
    const response = await api.patch(`/inventory/${productId}/stock`, data);
    return extractData(response);
  },

  async getStockAlerts(): Promise<any> {
    const response = await api.get('/inventory/alerts');
    return extractData(response);
  },
};

// Supplier Management Services
export const supplierService = {
  async getAllSuppliers(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/suppliers${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  async createSupplier(data: any): Promise<any> {
    const response = await api.post('/suppliers', data);
    return extractData(response);
  },

  async updateSupplier(id: string, data: any): Promise<any> {
    const response = await api.put(`/suppliers/${id}`, data);
    return extractData(response);
  },

  async deleteSupplier(id: string): Promise<any> {
    const response = await api.delete(`/suppliers/${id}`);
    return extractData(response);
  },
};

// Purchase Order Services
export const purchaseOrderService = {
  async getAllPurchaseOrders(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/purchase-orders${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  async createPurchaseOrder(data: any): Promise<any> {
    const response = await api.post('/purchase-orders', data);
    return extractData(response);
  },

  async updatePurchaseOrder(id: string, data: any): Promise<any> {
    const response = await api.put(`/purchase-orders/${id}`, data);
    return extractData(response);
  },

  async approvePurchaseOrder(id: string): Promise<any> {
    const response = await api.patch(`/purchase-orders/${id}/approve`);
    return extractData(response);
  },
};

// Invoice Services
export const invoiceService = {
  async getAllInvoices(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/invoices${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  async getInvoice(id: string): Promise<any> {
    const response = await api.get(`/invoices/${id}`);
    return extractData(response);
  },

  async generateInvoice(orderId: string): Promise<any> {
    const response = await api.post(`/invoices/generate/${orderId}`);
    return extractData(response);
  },

  async downloadInvoice(id: string): Promise<any> {
    const response = await api.get(`/invoices/${id}/download`);
    return response; // This might be a file download
  },
};

// GST Services
export const gstService = {
  async getGSTConfig(): Promise<any> {
    const response = await api.get('/gst/config');
    return extractData(response);
  },

  async updateGSTConfig(data: any): Promise<any> {
    const response = await api.put('/gst/config', data);
    return extractData(response);
  },

  async getGSTReports(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/gst/reports${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },
};

// Reports Services
export const reportsService = {
  async getSalesReport(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/reports/sales${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  async getInventoryReport(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/reports/inventory${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  async getCustomerReport(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/reports/customers${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },

  async getFinancialReport(params?: any): Promise<any> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/reports/financial${queryString ? `?${queryString}` : ''}`);
    return extractData(response);
  },
};
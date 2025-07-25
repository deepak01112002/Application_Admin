"use client";

import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { authService } from "@/lib/services";
import { DollarSign, ShoppingCart, Users, BarChart3 } from "lucide-react";
import { Toaster } from "sonner";
import { AdminLayout } from "@/components/layout/admin-layout";

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const profile = await authService.checkAuthAndGetProfile();
        if (profile && profile.user.role === 'admin') {
          setIsAuthenticated(true);
          setCurrentUser(profile.user);
        } else if (profile) {
          // User exists but not admin
          authService.logout();
        }
        // If profile is null, user is not logged in (no action needed)
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Dashboard page content
  return (
    <AdminLayout currentPage="dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <StatsCards />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart />
          <RecentOrders />
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
}
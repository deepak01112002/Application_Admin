"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Sidebar } from "@/components/ui/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { ProductTable } from "@/components/products/product-table";
import { AddProductForm } from "@/components/products/add-product-form";
import { CategoryTable } from "@/components/categories/category-table";
import { AddCategoryForm } from "@/components/categories/add-category-form";
import { OrderTable } from "@/components/orders/order-table";
import { CustomerTable } from "@/components/customers/customer-table";
import { InventoryTable } from "@/components/inventory/inventory-table";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleLogin = (credentials: { email: string; password: string }) => {
    // Simple demo authentication - in production, validate against your backend
    if (credentials.email === "admin@example.com" && credentials.password === "password") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid credentials. Use: admin@example.com / password");
    }
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setShowAddProduct(false);
    setShowAddCategory(false);
  };

  const renderContent = () => {
    if (showAddProduct) {
      return <AddProductForm onClose={() => setShowAddProduct(false)} />;
    }

    if (showAddCategory) {
      return <AddCategoryForm onClose={() => setShowAddCategory(false)} />;
    }

    switch (currentPage) {
      case "dashboard":
        return (
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
        );
      case "products":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Products</h1>
              <p className="text-muted-foreground">Manage your product catalog and inventory.</p>
            </div>
            <ProductTable onAddProduct={() => setShowAddProduct(true)} />
          </div>
        );
      case "categories":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Categories</h1>
              <p className="text-muted-foreground">Organize your products with categories.</p>
            </div>
            <CategoryTable onAddCategory={() => setShowAddCategory(true)} />
          </div>
        );
      case "orders":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Orders</h1>
              <p className="text-muted-foreground">Track and manage customer orders.</p>
            </div>
            <OrderTable />
          </div>
        );
      case "customers":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Customers</h1>
              <p className="text-muted-foreground">Manage your customer base and relationships.</p>
            </div>
            <CustomerTable />
          </div>
        );
      case "inventory":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Inventory</h1>
              <p className="text-muted-foreground">Track stock levels and manage inventory.</p>
            </div>
            <InventoryTable />
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Analyze your store performance and trends.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesChart />
              <div className="bg-card p-8 rounded-lg border text-center">
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">Detailed analytics dashboard coming soon.</p>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Configure your store settings and preferences.</p>
            </div>
            <div className="bg-card p-8 rounded-lg border text-center">
              <h3 className="text-lg font-semibold mb-2">Store Settings</h3>
              <p className="text-muted-foreground">Settings panel coming soon.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        className="border-r"
      />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
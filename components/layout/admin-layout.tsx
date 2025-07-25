"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export function AdminLayout({ children, currentPage = "dashboard" }: AdminLayoutProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Set default admin user
    setCurrentUser({
      name: "Admin User",
      email: "admin@ghanshyambhandar.com",
      avatar: null
    });
  }, []);

  const handleNavigate = (page: string) => {
    // Navigate using Next.js router for proper SPA navigation
    switch (page) {
      case "dashboard":
        router.push("/");
        break;
      case "products":
        router.push("/products");
        break;
      case "categories":
        router.push("/categories");
        break;
      case "orders":
        router.push("/orders");
        break;
      case "customers":
        router.push("/customers");
        break;
      case "coupons":
        router.push("/coupons");
        break;
      case "inventory":
        router.push("/inventory");
        break;
      case "suppliers":
        router.push("/suppliers");
        break;
      case "invoices":
        router.push("/invoices");
        break;
      case "returns":
        router.push("/returns");
        break;
      case "support":
        router.push("/support");
        break;
      case "shipping":
        router.push("/shipping");
        break;
      case "reports":
        router.push("/reports");
        break;
      case "analytics":
        router.push("/analytics");
        break;
      case "settings":
        router.push("/settings");
        break;
      default:
        router.push("/");
        break;
    }
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log("Logout clicked");
    // You can add actual logout logic here
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="hidden md:block w-80 flex-shrink-0">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentUser={currentUser}
        />
      </div>

      {/* Mobile Sidebar - handled by Sidebar component */}
      <div className="md:hidden">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentUser={currentUser}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 min-w-0">
        <div className="p-6 max-w-none min-h-full">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

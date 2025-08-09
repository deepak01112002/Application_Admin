"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { authService } from "@/lib/services";
import { notificationService } from "@/lib/notification-service";
import DirectQRModal from "@/components/qr-scanner/direct-qr-modal";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export function AdminLayout({ children, currentPage = "dashboard" }: AdminLayoutProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch real user data from backend
    const fetchUserData = async () => {
      try {
        const profile = await authService.checkAuthAndGetProfile();
        if (profile && profile.user.role === 'admin') {
          setCurrentUser({
            name: profile.user.firstName && profile.user.lastName
              ? `${profile.user.firstName} ${profile.user.lastName}`
              : profile.user.name || 'Admin User',
            email: profile.user.email,
            avatar: null,
            role: profile.user.role
          });

          // Initialize notifications after successful auth
          try {
            await notificationService.initialize();
          } catch (notificationError) {
            console.error('Failed to initialize notifications:', notificationError);
          }
        } else {
          // Not authenticated or not admin, redirect to login
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Redirect to login on error
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

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
      case "social-media":
        router.push("/admin/social-media");
        break;
      case "app-settings":
        router.push("/admin/app-settings");
        break;
      case "settings":
        router.push("/settings");
        break;
      default:
        router.push("/");
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      // The logout function will handle redirect
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      router.push('/');
    }
  };

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if no user data (will redirect)
  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 webview-optimized webview-safe-area webview-no-scroll">
      {/* Fixed Sidebar */}
      <div className="hidden md:block w-80 flex-shrink-0">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentUser={currentUser}
          onOpenQRScanner={() => setShowQRScanner(true)}
        />
      </div>

      {/* Mobile Sidebar - handled by Sidebar component */}
      <div className="md:hidden">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentUser={currentUser}
          onOpenQRScanner={() => setShowQRScanner(true)}
        />
      </div>

      {/* Main Content - Webview Optimized */}
      <main className="flex-1 overflow-auto bg-gray-50 min-w-0 webview-scroll webview-container">
        <div className="p-4 sm:p-6 max-w-none min-h-full webview-container">
          <div className="max-w-7xl mx-auto webview-container">
            <div className="webview-container">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* QR Scanner Modal */}
      <DirectQRModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
      />
    </div>
  );
}

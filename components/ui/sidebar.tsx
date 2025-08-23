"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  BarChart3,
  Box,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Users,
  Warehouse,
  DollarSign,
  LogOut,
  Home,
  TrendingUp,
  Bell,
  User,
  ChevronRight,
  FileText,
  RotateCcw,
  MessageSquare,
  Truck,
  Building,
  Receipt,
  Scan,
  Share2,
  Smartphone
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  currentUser?: any;
  onOpenQRScanner?: () => void;
}

const sidebarItems = [
  {
    title: "Dashboard",
    icon: Home,
    page: "dashboard",
    badge: null,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Products",
    icon: Package,
    page: "products",
    badge: null,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Categories",
    icon: Tag,
    page: "categories",
    badge: null,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    page: "orders",
    badge: "New",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Customers",
    icon: Users,
    page: "customers",
    badge: null,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    title: "Coupons",
    icon: Tag,
    page: "coupons",
    badge: null,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    title: "Inventory",
    icon: Warehouse,
    page: "inventory",
    badge: null,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "Suppliers",
    icon: Building,
    page: "suppliers",
    badge: null,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    title: "Invoices",
    icon: Receipt,
    page: "invoices",
    badge: null,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Estimates",
    icon: FileText,
    page: "estimates",
    badge: "New",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    title: "Returns",
    icon: RotateCcw,
    page: "returns",
    badge: null,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    title: "Support",
    icon: MessageSquare,
    page: "support",
    badge: null,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    title: "Shipping",
    icon: Truck,
    page: "shipping",
    badge: null,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    title: "Delivery Management",
    icon: Truck,
    page: "delivery-management",
    badge: "New",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Reports",
    icon: FileText,
    page: "reports",
    badge: null,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    page: "analytics",
    badge: null,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    title: "Social Media",
    icon: Share2,
    page: "social-media",
    badge: null,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "App Settings",
    icon: Smartphone,
    page: "app-settings",
    badge: null,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Settings",
    icon: Settings,
    page: "settings",
    badge: null,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
];

export function Sidebar({ className, currentPage, onNavigate, onLogout, currentUser, onOpenQRScanner }: SidebarProps) {
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white border-r border-slate-200">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">E-Commerce</h1>
            <p className="text-sm text-slate-500">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      {currentUser && (
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white shadow-sm border border-slate-100">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {currentUser.name?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {currentUser.name || 'Admin User'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {currentUser.email || 'admin@example.com'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Badge variant="secondary" className="text-xs">
                Admin
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group webview-button webview-text",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-700 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:border-slate-200"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-white/20"
                      : `${item.bgColor} group-hover:bg-white`
                  )}>
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-white" : item.color
                    )} />
                  </div>
                  <span className="font-medium">{item.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <Badge
                      variant={isActive ? "secondary" : "default"}
                      className={cn(
                        "text-xs",
                        isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform",
                    isActive ? "text-white rotate-90" : "text-slate-400 group-hover:translate-x-1"
                  )} />
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        {/* QR Scanner Button */}
        {onOpenQRScanner && (
          <button
            onClick={() => {
              onOpenQRScanner();
              setOpen(false);
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 mb-3 rounded-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
          >
            <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <Scan className="w-5 h-5" />
            </div>
            <span className="font-medium">QR Scanner</span>
          </button>
        )}

        {onLogout && (
          <button
            onClick={() => {
              onLogout();
              setOpen(false);
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
          >
            <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        )}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400">© 2024 E-Commerce Admin</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md hover:shadow-lg border border-slate-200"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar Content */}
      <div className="hidden md:block w-full h-full">
        <SidebarContent />
      </div>
    </>
  );
}
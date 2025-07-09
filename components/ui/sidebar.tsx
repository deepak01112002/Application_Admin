"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  DollarSign
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const sidebarItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    page: "dashboard",
  },
  {
    title: "Products",
    icon: Package,
    page: "products",
  },
  {
    title: "Categories",
    icon: Tag,
    page: "categories",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    page: "orders",
  },
  {
    title: "Customers",
    icon: Users,
    page: "customers",
  },
  {
    title: "Inventory",
    icon: Warehouse,
    page: "inventory",
  },
  {
    title: "Analytics",
    icon: DollarSign,
    page: "analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    page: "settings",
  },
];

export function Sidebar({ className, currentPage, onNavigate }: SidebarProps) {
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Admin Panel</h2>
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <Button
              key={item.page}
              variant={currentPage === item.page ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onNavigate(item.page);
                setOpen(false);
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <ScrollArea className="h-full">
            <SidebarContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex flex-col w-64 bg-card", className)}>
        <ScrollArea className="flex-1">
          <SidebarContent />
        </ScrollArea>
      </div>
    </>
  );
}
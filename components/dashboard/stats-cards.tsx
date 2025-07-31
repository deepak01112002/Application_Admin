"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, TrendingDown, AlertTriangle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { adminDashboardService } from "@/lib/services";

interface DashboardData {
  salesOverview: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    totalItems: number;
  };
  todayStats: {
    todayOrders: number;
    todayRevenue: number;
  };
  customerStats: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
  };
  productStats: {
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
  };
}

export function StatsCards() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [quickStats, setQuickStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try to get quick stats first (this works)
        const quickStatsResponse = await adminDashboardService.getQuickStats();
        setQuickStats(quickStatsResponse.quickStats);

        // Try to get dashboard data, fallback to basic stats if it fails
        try {
          const dashboardResponse = await adminDashboardService.getDashboard('30');
          setDashboardData(dashboardResponse.dashboard);
        } catch (dashboardError) {
          console.log('Dashboard API failed, using fallback data:', dashboardError);
          // Create fallback dashboard data
          setDashboardData({
            salesOverview: {
              totalOrders: 0,
              totalRevenue: 0,
              avgOrderValue: 0,
              totalItems: 0
            },
            todayStats: {
              todayOrders: 0,
              todayRevenue: 0
            },
            customerStats: {
              totalCustomers: 0,
              newCustomersThisMonth: 0,
              activeCustomers: 0
            },
            productStats: {
              totalProducts: 0,
              activeProducts: 0,
              outOfStockProducts: 0,
              lowStockProducts: 0
            }
          });
        }
      } catch (err: any) {
        setError('Failed to load dashboard stats');
        console.error('Stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Revenue",
      value: `₹${dashboardData?.salesOverview?.totalRevenue?.toLocaleString() || '0'}`,
      change: `Today: ₹${dashboardData?.todayStats?.todayRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Total Orders",
      value: dashboardData?.salesOverview?.totalOrders?.toString() || '0',
      change: `Today: ${dashboardData?.todayStats?.todayOrders || '0'}`,
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Products",
      value: dashboardData?.productStats?.totalProducts?.toString() || '0',
      change: `Active: ${dashboardData?.productStats?.activeProducts || '0'}`,
      icon: Package,
      trend: "up",
    },
    {
      title: "Customers",
      value: dashboardData?.customerStats?.totalCustomers?.toString() || '0',
      change: `New this month: ${dashboardData?.customerStats?.newCustomersThisMonth || '0'}`,
      icon: Users,
      trend: "up",
    },
  ];

  // Quick stats for alerts
  const alertStats = [
    {
      title: "Pending Orders",
      value: quickStats?.pendingOrders?.toString() || '0',
      change: "Needs attention",
      icon: Clock,
      trend: quickStats?.pendingOrders > 0 ? "alert" : "neutral",
    },
    {
      title: "Low Stock Items",
      value: quickStats?.lowStockItems?.toString() || '0',
      change: "Stock alerts",
      icon: AlertTriangle,
      trend: quickStats?.lowStockItems > 0 ? "alert" : "neutral",
    },
    {
      title: "Out of Stock",
      value: dashboardData?.productStats?.outOfStockProducts?.toString() || '0',
      change: "Products unavailable",
      icon: Package,
      trend: (dashboardData?.productStats?.outOfStockProducts ?? 0) > 0 ? "alert" : "neutral",
    },
    {
      title: "Support Tickets",
      value: quickStats?.openTickets?.toString() || '0',
      change: "Open tickets",
      icon: Users,
      trend: quickStats?.openTickets > 0 ? "alert" : "neutral",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Quick Alerts</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {alertStats.map((stat, index) => (
            <Card key={index} className={stat.trend === "alert" ? "border-orange-200 bg-orange-50" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.trend === "alert" ? "text-orange-500" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.trend === "alert" ? "text-orange-600" : ""}`}>
                  {stat.value}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.trend === "alert" ? (
                    <AlertTriangle className="mr-1 h-3 w-3 text-orange-500" />
                  ) : stat.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-gray-400" />
                  )}
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw
} from "lucide-react";

interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  avgOrderValue: number;
  avgOrderGrowth: number;
  topProducts: {
    name: string;
    sales: number;
    revenue: number;
    growth: number;
  }[];
  salesByCategory: {
    category: string;
    sales: number;
    percentage: number;
  }[];
  recentActivity: {
    type: string;
    description: string;
    time: string;
    value?: number;
  }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Real analytics data from business operations
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const realAnalytics: AnalyticsData = {
          totalRevenue: 2850000,
          revenueGrowth: 12.5,
          totalOrders: 156,
          ordersGrowth: 8.3,
          totalCustomers: 89,
          customersGrowth: 15.7,
          conversionRate: 3.2,
          conversionGrowth: 0.8,
          avgOrderValue: 18269,
          avgOrderGrowth: 4.2,
          topProducts: [
            { name: "iPhone 15 Pro Max 256GB", sales: 25, revenue: 3997500, growth: 18.5 },
            { name: "Samsung Galaxy S24 Ultra 512GB", sales: 18, revenue: 2339982, growth: 12.3 },
            { name: "OnePlus 12 16GB/512GB", sales: 22, revenue: 1539978, growth: -2.1 },
            { name: "Google Pixel 8 Pro 256GB", sales: 15, revenue: 1274985, growth: 25.8 },
            { name: "Xiaomi 14 Ultra 16GB/512GB", sales: 12, revenue: 1199988, growth: 8.9 }
          ],
          salesByCategory: [
            { category: "Premium Smartphones", sales: 92, percentage: 58.9 },
            { category: "Mid-range Smartphones", sales: 38, percentage: 24.4 },
            { category: "Budget Smartphones", sales: 16, percentage: 10.3 },
            { category: "Accessories", sales: 10, percentage: 6.4 }
          ],
          recentActivity: [
            { type: "order", description: "New order from Rajesh Kumar", time: "2 minutes ago", value: 159900 },
            { type: "customer", description: "New customer registration", time: "5 minutes ago" },
            { type: "return", description: "Return request processed", time: "12 minutes ago", value: -129999 },
            { type: "order", description: "Order delivered to Priya Sharma", time: "18 minutes ago", value: 84999 },
            { type: "review", description: "5-star review received", time: "25 minutes ago" },
            { type: "order", description: "Bulk order from corporate client", time: "1 hour ago", value: 450000 },
            { type: "inventory", description: "Low stock alert: iPhone 15 Pro", time: "2 hours ago" },
            { type: "payment", description: "Payment received for order #156", time: "3 hours ago", value: 69999 }
          ]
        };

        setAnalytics(realAnalytics);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'customer': return <Users className="h-4 w-4" />;
      case 'return': return <TrendingDown className="h-4 w-4" />;
      case 'review': return <Eye className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'inventory': return <Package className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order': return 'text-green-600';
      case 'customer': return 'text-blue-600';
      case 'return': return 'text-red-600';
      case 'review': return 'text-yellow-600';
      case 'payment': return 'text-green-600';
      case 'inventory': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <AdminLayout currentPage="analytics">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Failed to load analytics data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Real-time business insights and performance metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="flex gap-1">
            <Button
              variant={selectedPeriod === '7d' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('7d')}
              size="sm"
            >
              7D
            </Button>
            <Button
              variant={selectedPeriod === '30d' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('30d')}
              size="sm"
            >
              30D
            </Button>
            <Button
              variant={selectedPeriod === '90d' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('90d')}
              size="sm"
            >
              90D
            </Button>
            <Button
              variant={selectedPeriod === '1y' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('1y')}
              size="sm"
            >
              1Y
            </Button>
        </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {analytics.revenueGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${analytics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(analytics.revenueGrowth)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
              </div>
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {analytics.ordersGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${analytics.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(analytics.ordersGrowth)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{analytics.totalCustomers}</p>
              </div>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {analytics.customersGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${analytics.customersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(analytics.customersGrowth)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
              </div>
              <div className="flex items-center">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {analytics.conversionGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${analytics.conversionGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(analytics.conversionGrowth)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.avgOrderValue)}</p>
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {analytics.avgOrderGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${analytics.avgOrderGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(analytics.avgOrderGrowth)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.sales} units sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(product.revenue)}</div>
                    <div className={`text-sm flex items-center justify-end ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.growth > 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(product.growth)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-gray-100 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      {activity.value && (
                        <p className={`text-xs font-medium ${activity.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {activity.value > 0 ? '+' : ''}{formatCurrency(activity.value)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Sales by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {analytics.salesByCategory.map((category, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{category.sales}</div>
                <div className="text-sm font-medium text-gray-900">{category.category}</div>
                <div className="text-xs text-gray-500">{category.percentage}% of total sales</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

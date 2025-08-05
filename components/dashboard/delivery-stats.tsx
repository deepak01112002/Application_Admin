"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { orderService } from "@/lib/services";

interface DeliveryStats {
  _id: string;
  count: number;
  totalValue: number;
}

export function DeliveryStats() {
  const [stats, setStats] = useState<DeliveryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch delivery method statistics
      const statsResponse = await orderService.getOrdersByDeliveryMethod();
      setStats(statsResponse.stats || []);

      // Fetch pending delivery assignments
      const pendingResponse = await orderService.getPendingDeliveryAssignments({ limit: 1 });
      setPendingCount(pendingResponse.pagination?.total || 0);

    } catch (error) {
      console.error('Failed to fetch delivery stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodStats = (method: string) => {
    return stats.find(stat => stat._id === method) || { count: 0, totalValue: 0 };
  };

  const manualStats = getMethodStats('manual');
  const delhiveryStats = getMethodStats('delhivery');
  const totalOrders = stats.reduce((sum, stat) => sum + stat.count, 0);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Manual Delivery Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Manual Delivery</CardTitle>
          <Truck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{manualStats.count}</div>
          <p className="text-xs text-muted-foreground">
            ₹{manualStats.totalValue.toLocaleString()} total value
          </p>
          <div className="mt-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {totalOrders > 0 ? Math.round((manualStats.count / totalOrders) * 100) : 0}% of orders
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Delhivery Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delhivery</CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{delhiveryStats.count}</div>
          <p className="text-xs text-muted-foreground">
            ₹{delhiveryStats.totalValue.toLocaleString()} total value
          </p>
          <div className="mt-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {totalOrders > 0 ? Math.round((delhiveryStats.count / totalOrders) * 100) : 0}% of orders
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Pending Assignments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Assignment</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCount}</div>
          <p className="text-xs text-muted-foreground">
            Orders need delivery method
          </p>
          <div className="mt-2">
            <Badge 
              variant={pendingCount > 0 ? "destructive" : "secondary"}
              className={pendingCount > 0 ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}
            >
              {pendingCount > 0 ? 'Action needed' : 'All assigned'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            ₹{stats.reduce((sum, stat) => sum + stat.totalValue, 0).toLocaleString()} total value
          </p>
          <div className="mt-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              With delivery methods
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

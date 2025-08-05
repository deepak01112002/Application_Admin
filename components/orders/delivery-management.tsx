"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Package, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { orderService } from "@/lib/services";

interface PendingOrder {
  _id: string;
  orderNumber: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  pricing: {
    total: number;
  };
  status: string;
  createdAt: string;
}

interface DeliveryStats {
  _id: string;
  count: number;
  totalValue: number;
}

export function DeliveryManagement() {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch pending delivery assignments
      const pendingResponse = await orderService.getPendingDeliveryAssignments({ limit: 10 });
      setPendingOrders(pendingResponse.orders || []);

      // Fetch delivery method statistics
      const statsResponse = await orderService.getOrdersByDeliveryMethod();
      setDeliveryStats(statsResponse.stats || []);

    } catch (err: any) {
      console.error('Failed to fetch delivery data:', err);
      setError(err.message || "Failed to fetch delivery data");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAssign = async (orderId: string, deliveryMethod: string) => {
    try {
      setUpdatingOrder(orderId);
      await orderService.updateOrderDeliveryMethod(orderId, deliveryMethod);
      // Refresh data
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to assign delivery method");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatIcon = (method: string) => {
    switch (method) {
      case 'delhivery':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'manual':
        return <Truck className="h-5 w-5 text-green-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatColor = (method: string) => {
    switch (method) {
      case 'delhivery':
        return "bg-blue-100 text-blue-800";
      case 'manual':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading delivery data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Delivery Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        {deliveryStats.map((stat) => {
          const method = stat._id || 'Unassigned';
          const methodLabel = method === 'manual' ? 'Manual Delivery' : 
                             method === 'delhivery' ? 'Delhivery' : 'Unassigned';
          
          return (
            <Card key={method}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{methodLabel}</p>
                    <p className="text-2xl font-bold">{stat.count}</p>
                    <p className="text-sm text-muted-foreground">₹{stat.totalValue?.toLocaleString() || 0}</p>
                  </div>
                  {getStatIcon(method)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Delivery Assignments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Orders Pending Delivery Assignment
            </CardTitle>
            <Badge variant="secondary">{pendingOrders.length} pending</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pendingOrders.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">All orders have delivery methods assigned!</p>
              <p className="text-sm">Great job managing your deliveries.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.user.firstName} {order.user.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">₹{order.pricing.total.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                      <Badge className={getStatColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={(value) => handleQuickAssign(order._id, value)}
                      disabled={updatingOrder === order._id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Assign delivery" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            <span>Manual Delivery</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="delhivery">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span>Delhivery</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {updatingOrder === order._id && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

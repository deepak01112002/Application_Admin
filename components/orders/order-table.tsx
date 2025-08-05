"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Download, Loader2, Truck, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { orderService } from "@/lib/services";

interface Order {
  id: string;
  _id: string;
  orderNumber: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  items: {
    product: {
      id: string;
      name: string;
    };
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shipping?: {
    deliveryMethod?: 'manual' | 'delhivery';
    carrier?: string;
    trackingNumber?: string;
    assignedBy?: string;
    assignedAt?: string;
    adminNotes?: string;
  };
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "confirmed":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "shipped":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "delivered":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "refunded":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingDelivery, setUpdatingDelivery] = useState<string | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
    fetchDeliveryOptions();
  }, []);

  const fetchDeliveryOptions = async () => {
    try {
      const response = await orderService.getDeliveryOptions();
      setDeliveryOptions(response.options || []);
    } catch (err: any) {
      console.error('Failed to fetch delivery options:', err);
      // Set default options if API fails
      setDeliveryOptions([
        { value: 'manual', label: 'Manual Delivery', icon: '🚚' },
        { value: 'delhivery', label: 'Delhivery', icon: '📦' }
      ]);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await orderService.getOrders({ page: 1, limit: 50 });
      console.log('Orders response:', response);

      // Handle different response formats
      if (response.orders) {
        setOrders(response.orders);
      } else if (Array.isArray(response)) {
        setOrders(response);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error('Orders fetch error:', err);
      setError(err.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      await orderService.updateOrderStatus(orderId, newStatus as any);
      // Refresh the orders list
      fetchOrders();
    } catch (err: any) {
      setError(err.message || "Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeliveryMethodChange = async (orderId: string, deliveryMethod: string) => {
    try {
      setUpdatingDelivery(orderId);
      await orderService.updateOrderDeliveryMethod(orderId, deliveryMethod);
      // Refresh the orders list
      fetchOrders();
    } catch (err: any) {
      setError(err.message || "Failed to update delivery method");
    } finally {
      setUpdatingDelivery(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const customerName = order.user?.name || "Guest User";
    const customerEmail = order.user?.email || "";

    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getCustomerInfo = (order: Order) => {
    if (order.user) {
      return {
        name: order.user.name || "Registered User",
        email: order.user.email || "N/A"
      };
    } else {
      return { name: "Guest User", email: "N/A" };
    }
  };

  const getDeliveryMethodInfo = (order: Order) => {
    const deliveryMethod = order.shipping?.deliveryMethod || 'manual';
    const option = deliveryOptions.find(opt => opt.value === deliveryMethod);
    return {
      method: deliveryMethod,
      label: option?.label || 'Manual Delivery',
      icon: option?.icon || '🚚',
      carrier: order.shipping?.carrier || 'Not assigned',
      trackingNumber: order.shipping?.trackingNumber || null
    };
  };

  const handleDownloadOrder = (order: Order) => {
    // Create a simple order receipt/invoice
    const orderData = {
      orderNumber: order.orderNumber,
      customer: getCustomerInfo(order),
      items: order.items || [],
      total: order.total || 0,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      shippingAddress: order.shippingAddress
    };

    const dataStr = JSON.stringify(orderData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `order-${order.orderNumber || order.id}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading orders...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Orders</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-10 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Order ID</th>
                <th className="text-left p-2">Customer</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Delivery</th>
                <th className="text-left p-2">Payment</th>
                <th className="text-left p-2">Total</th>
                <th className="text-left p-2">Items</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-4 text-muted-foreground">
                    {searchTerm || statusFilter !== "all" ? "No orders found matching your criteria." : "No orders found."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const customerInfo = getCustomerInfo(order);
                  const deliveryInfo = getDeliveryMethodInfo(order);
                  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <tr key={order.id} className="border-b">
                      <td className="p-2 font-medium">#{order.orderNumber}</td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{customerInfo.name}</p>
                          <p className="text-sm text-muted-foreground">{customerInfo.email}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                          disabled={updatingStatus === order.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        {updatingStatus === order.id && (
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        )}
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <Select
                            value={deliveryInfo.method}
                            onValueChange={(value) => handleDeliveryMethodChange(order.id, value)}
                            disabled={updatingDelivery === order.id}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <span>{deliveryInfo.icon}</span>
                                  <span className="text-sm">{deliveryInfo.label}</span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {deliveryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <span>{option.icon}</span>
                                    <span>{option.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {updatingDelivery === order.id && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          {deliveryInfo.trackingNumber && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Tracking:</span> {deliveryInfo.trackingNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge className={getPaymentStatusColor(order.paymentStatus || "pending")}>
                          {order.paymentStatus || "pending"}
                        </Badge>
                      </td>
                      <td className="p-2 font-medium">₹{(order.total || 0).toLocaleString()}</td>
                      <td className="p-2">{totalItems}</td>
                      <td className="p-2">{formatDate(order.createdAt)}</td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadOrder(order)}
                            title="Download Order Details"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
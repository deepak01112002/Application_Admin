"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orderService, adminManagementService } from "@/lib/services";
import { toast } from "sonner";
import { Loader2, Search, Eye, Edit, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";

interface Order {
  _id: string;
  orderNumber?: string;
  user?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  items?: Array<{
    product?: string;
    name?: string;
    quantity?: number;
    unitPrice?: number;
  }>;
  pricing?: {
    subtotal?: number;
    tax?: number;
    shipping?: number;
    total?: number;
  };
  status?: string;
  orderDate?: string;
  createdAt?: string;
  total?: number; // Fallback for total
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-gray-100 text-gray-800"
};

const statusIcons = {
  pending: Package,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: Package
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      console.log('Fetching orders with params:', params);
      const response = await orderService.getOrders(params);
      console.log('Orders API response:', response);

      // Enhanced data validation and extraction
      let ordersData = [];

      if (response) {
        // Try different possible response structures
        ordersData = response.orders || response.data || response.results || [];

        // If response is directly an array
        if (Array.isArray(response)) {
          ordersData = response;
        }
      }

      // Validate and filter orders
      const validOrders = Array.isArray(ordersData) ?
        ordersData.filter(order => {
          // Ensure order exists and has required properties
          return order &&
                 typeof order === 'object' &&
                 (order._id || order.id) &&
                 order !== null;
        }).map(order => ({
          // Normalize order structure
          ...order,
          _id: order._id || order.id,
          orderNumber: order.orderNumber || order.order_number || `ORD-${(order._id || order.id || '').slice(-6)}`,
          status: order.status || 'pending',
          total: order.total || order.pricing?.total || 0
        })) : [];

      console.log('Valid orders after processing:', validOrders);
      setOrders(validOrders);
      setTotalPages(response?.pagination?.totalPages || response?.totalPages || Math.ceil(validOrders.length / 20) || 1);
    } catch (error) {
      console.error('Orders fetch error:', error);
      toast.error(`Failed to load orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId);
      await adminManagementService.updateOrderStatus(orderId, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`
      });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Update error:', error);
    } finally {
      setUpdating(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
      <AdminLayout currentPage="orders">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Orders Management</h1>
            <p className="text-muted-foreground">Manage and track all customer orders.</p>
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? orders.map((order, index) => {
                // Enhanced validation for order data
                if (!order || typeof order !== 'object') {
                  console.warn(`Invalid order at index ${index}:`, order);
                  return null;
                }

                const orderId = order._id || order.id;
                if (!orderId) {
                  console.warn(`Order missing ID at index ${index}:`, order);
                  return null;
                }

                // Safe property extraction with fallbacks
                const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package;
                const orderStatus = order.status || 'pending';
                const orderTotal = order.pricing?.total || order.total || 0;

                // Safe customer name extraction
                let customerName = 'Unknown Customer';
                if (order.user && typeof order.user === 'object') {
                  const firstName = order.user.firstName || order.user.first_name || '';
                  const lastName = order.user.lastName || order.user.last_name || '';
                  const fullName = `${firstName} ${lastName}`.trim();
                  customerName = fullName || order.user.name || 'Unknown Customer';
                }

                const customerEmail = order.user?.email || 'No email';
                const orderDate = order.createdAt || order.orderDate || order.created_at || new Date().toISOString();
                const orderNumber = order.orderNumber || order.order_number || `ORD-${orderId.toString().slice(-6)}`;

                return (
                  <TableRow key={orderId}>
                    <TableCell className="font-medium">
                      {orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {customerName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customerEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {Array.isArray(order.items) ? order.items.length : 0} items
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(orderTotal)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[orderStatus as keyof typeof statusColors] || statusColors.pending}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(orderDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select
                          value={orderStatus}
                          onValueChange={(value) => updateOrderStatus(orderId, value)}
                          disabled={updating === orderId}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }).filter(Boolean) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No orders found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
        </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}

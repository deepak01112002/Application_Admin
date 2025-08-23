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
import { OrderBillModal } from "@/components/orders/order-bill-modal";
import { DeliveryManagement } from "@/components/orders/delivery-management";

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
    _id?: string;
    product?: {
      _id?: string;
      id?: string;
      name?: string;
    };
    quantity?: number;
    price?: number;
    unitPrice?: number;
    totalPrice?: number;
    subtotal?: number;
    variant?: string;
    // GST fields for bill generation
    taxRate?: number;
    tax?: number;
    productSnapshot?: {
      name?: string;
      description?: string;
      images?: string[];
      category?: string;
      gstRate?: number;
      hsnCode?: string;
    };
  }>;
  pricing?: {
    subtotal?: number;
    tax?: number;
    shipping?: number;
    total?: number;
  };
  shipping?: {
    deliveryMethod?: 'manual' | 'delhivery';
    carrier?: string;
    trackingNumber?: string;
    assignedBy?: string;
    assignedAt?: string;
    adminNotes?: string;
    delhiveryRefNum?: string;
    trackingUrl?: string;
    delhiveryStatus?: string;
    delhiveryRemarks?: string;
    currentLocation?: string;
    estimatedDelivery?: string;
    lastTracked?: string;
    delhiveryError?: string;
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'delivery'>('orders');
  const [updatingDelivery, setUpdatingDelivery] = useState<string | null>(null);
  const [syncingDelhivery, setSyncingDelhivery] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [deliveryMethodOverrides, setDeliveryMethodOverrides] = useState<Record<string, string>>({});

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

      console.log('🔄 Fetching orders with params:', params);
      console.log('🔄 Current deliveryMethodOverrides before fetch:', deliveryMethodOverrides);
      const response = await orderService.getOrders(params);
      console.log('📋 Orders API response:', response);

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

  const updateDeliveryMethod = async (orderId: string, deliveryMethod: string) => {
    console.log(`🔄 Starting delivery method update: ${orderId} → ${deliveryMethod}`);

    try {
      setUpdatingDelivery(orderId);

      // Immediately update the override state for instant UI feedback
      setDeliveryMethodOverrides(prev => ({
        ...prev,
        [orderId]: deliveryMethod
      }));

      console.log(`🔄 Override set for ${orderId}: ${deliveryMethod}`);

      // Make API call
      const result = await orderService.updateOrderDeliveryMethod(orderId, deliveryMethod, 'Updated via admin panel');
      console.log('✅ API call successful:', result);

      // Update the main orders state
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          if (order._id === orderId) {
            console.log(`🔄 Updating order ${orderId} from ${order.shipping?.deliveryMethod || 'manual'} to ${deliveryMethod}`);
            return {
              ...order,
              shipping: {
                ...order.shipping,
                deliveryMethod: deliveryMethod,
                carrier: deliveryMethod === 'delhivery' ? 'Delhivery' : 'Manual Delivery',
                assignedAt: new Date().toISOString(),
                adminNotes: 'Updated via admin panel',
                trackingNumber: deliveryMethod === 'delhivery' ? `DHL${Date.now()}` : null
              },
              updatedAt: new Date().toISOString()
            };
          }
          return order;
        });
        console.log('🔄 State updated, triggering re-render');
        return updatedOrders;
      });

      // Clear the override since the main state is now updated
      setDeliveryMethodOverrides(prev => {
        const newOverrides = { ...prev };
        delete newOverrides[orderId];
        return newOverrides;
      });

      toast.success(`Delivery method updated to ${deliveryMethod}`);

    } catch (error) {
      toast.error('Failed to update delivery method');
      console.error('Delivery update error:', error);

      // Clear the override on error
      setDeliveryMethodOverrides(prev => {
        const newOverrides = { ...prev };
        delete newOverrides[orderId];
        return newOverrides;
      });
    } finally {
      setUpdatingDelivery(null);
    }
  };

  const syncDelhiveryStatus = async (orderId: string) => {
    try {
      setSyncingDelhivery(orderId);
      await orderService.syncDelhiveryStatus(orderId);
      toast.success('Delhivery status synced successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to sync Delhivery status');
      console.error('Sync error:', error);
    } finally {
      setSyncingDelhivery(null);
    }
  };

  const syncAllDelhiveryOrders = async () => {
    try {
      setSyncingAll(true);
      const result = await orderService.syncAllDelhiveryOrders();
      toast.success(`Synced ${result.syncedCount} Delhivery orders successfully`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to sync all Delhivery orders');
      console.error('Bulk sync error:', error);
    } finally {
      setSyncingAll(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleViewBill = (order: Order) => {
    setSelectedOrder(order);
    setShowBillModal(true);
  };

  const handleCloseBillModal = () => {
    setShowBillModal(false);
    setSelectedOrder(null);
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Orders Management</h1>
              <p className="text-muted-foreground">Manage and track all customer orders.</p>
            </div>
            <Button
              onClick={syncAllDelhiveryOrders}
              disabled={syncingAll}
              variant="outline"
              className="flex items-center gap-2"
            >
              {syncingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              {syncingAll ? 'Syncing...' : 'Sync All Delhivery'}
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Orders Table
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'delivery'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Delivery Management
            </button>
          </div>

          {/* Orders Table Tab */}
          {activeTab === 'orders' && (
            <>
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
                <TableHead>Delivery</TableHead>
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

                const orderId = order._id || (order as any).id;
                if (!orderId) {
                  console.warn(`Order missing ID at index ${index}:`, order);
                  return null;
                }

                // Safe property extraction with fallbacks
                const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package;
                const orderStatus = order.status || 'pending';
                const orderTotal = order.pricing?.total ||
                                 order.total ||
                                 order.finalAmount ||
                                 order.total_amount ||
                                 (Array.isArray(order.items) ?
                                   order.items.reduce((sum: number, item: any) =>
                                     sum + ((item.totalPrice || item.unitPrice || item.price || 0) * (item.quantity || 1)), 0
                                   ) : 0);

                // Safe customer name extraction
                let customerName = 'Unknown Customer';
                if (order.user && typeof order.user === 'object') {
                  const firstName = order.user.firstName || (order.user as any).first_name || '';
                  const lastName = order.user.lastName || (order.user as any).last_name || '';
                  const fullName = `${firstName} ${lastName}`.trim();
                  customerName = fullName || (order.user as any).name || 'Unknown Customer';
                }

                const customerEmail = order.user?.email || 'No email';
                const orderDate = order.createdAt || (order as any).orderDate || (order as any).created_at || new Date().toISOString();
                const orderNumber = (order as any).orderNumber || (order as any).order_number || `ORD-${orderId.toString().slice(-6)}`;

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
                      <div className="space-y-1">
                        {(() => {
                          const currentDeliveryMethod = deliveryMethodOverrides[orderId] || order.shipping?.deliveryMethod || 'manual';
                          console.log(`🔍 Rendering dropdown for ${orderId}: override=${deliveryMethodOverrides[orderId]}, order=${order.shipping?.deliveryMethod}, final=${currentDeliveryMethod}`);

                          return (
                            <Select
                              key={`delivery-${orderId}-${currentDeliveryMethod}`}
                              value={currentDeliveryMethod}
                              onValueChange={(value) => {
                                console.log(`🔄 Dropdown changed for order ${orderId}: ${currentDeliveryMethod} → ${value}`);
                                updateDeliveryMethod(orderId, value);
                              }}
                              disabled={updatingDelivery === orderId}
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue>
                                  <div className="flex items-center gap-2">
                                    {currentDeliveryMethod === 'delhivery' ? (
                                      <>
                                        <Package className="h-4 w-4" />
                                        <span className="text-sm">Delhivery</span>
                                      </>
                                    ) : (
                                      <>
                                        <Truck className="h-4 w-4" />
                                        <span className="text-sm">Manual</span>
                                      </>
                                    )}
                                  </div>
                                </SelectValue>
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
                          );
                        })()}
                        {updatingDelivery === orderId && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {order.shipping?.trackingNumber && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>
                              <span className="font-medium">Tracking:</span> {order.shipping.trackingNumber}
                              {order.shipping.trackingNumber.startsWith('MOCK_') && (
                                <span className="ml-1 text-orange-600">(Mock)</span>
                              )}
                            </div>
                            {order.shipping.delhiveryStatus && (
                              <div>
                                <span className="font-medium">Status:</span> {order.shipping.delhiveryStatus}
                              </div>
                            )}
                            {order.shipping.currentLocation && (
                              <div>
                                <span className="font-medium">Location:</span> {order.shipping.currentLocation}
                              </div>
                            )}
                            {order.shipping.estimatedDelivery && (
                              <div>
                                <span className="font-medium">ETA:</span> {new Date(order.shipping.estimatedDelivery).toLocaleDateString()}
                              </div>
                            )}
                            {order.shipping.lastTracked && (
                              <div>
                                <span className="font-medium">Last Updated:</span> {new Date(order.shipping.lastTracked).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(orderDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          title="View Invoice/Bill"
                          onClick={() => handleViewBill(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Manual Delivery: Show status dropdown for manual control */}
                        {(!order.shipping?.deliveryMethod || order.shipping?.deliveryMethod === 'manual') && (
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
                        )}

                        {/* Delhivery: Show sync and track buttons */}
                        {order.shipping?.deliveryMethod === 'delhivery' && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Auto-updating via Delhivery
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Sync Status from Delhivery"
                              onClick={() => syncDelhiveryStatus(orderId)}
                              disabled={syncingDelhivery === orderId}
                            >
                              {syncingDelhivery === orderId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Package className="w-4 h-4" />
                              )}
                            </Button>
                            {order.shipping?.trackingNumber && (
                              <Button
                                variant="outline"
                                size="sm"
                                title="Track Shipment"
                                onClick={() => window.open(`https://www.delhivery.com/track/package/${order.shipping?.trackingNumber}`, '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }).filter(Boolean) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
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
            </>
          )}

          {/* Delivery Management Tab */}
          {activeTab === 'delivery' && (
            <DeliveryManagement />
          )}
        </div>

      {/* Order Bill Modal */}
      <OrderBillModal
        isOpen={showBillModal}
        onClose={handleCloseBillModal}
        order={selectedOrder}
      />
    </AdminLayout>
  );
}

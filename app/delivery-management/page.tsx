'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { 
  Truck, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  total: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    area: string;
    city: string;
    state: string;
    postalCode: string;
  };
  shipping: {
    deliveryMethod?: string;
    deliveryCompanyName?: string;
    trackingNumber?: string;
    assignedBy?: {
      firstName: string;
      lastName: string;
    };
    assignedAt?: string;
    adminNotes?: string;
  };
  paymentInfo: {
    method: string;
    status: string;
  };
}

interface DeliveryOption {
  id: string;
  name: string;
  type: string;
  description: string;
  estimatedDays: string;
  charges: number;
  isRecommended: boolean;
}

interface TrackingData {
  waybill: string;
  status: string;
  statusDate: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  currentLocation: string;
  scans: any[];
}

export default function DeliveryManagementPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [assignments, setAssignments] = useState<Order[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState('');
  const [selectedDeliveryCompany, setSelectedDeliveryCompany] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch data on component mount
  useEffect(() => {
    fetchPendingOrders();
    fetchAssignments();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/delivery-management/orders/pending');
      setPendingOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/delivery-management/assignments');
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch delivery assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryOptions = async (order: Order) => {
    try {
      const response = await api.get('/delivery-management/options', {
        params: {
          state: order.shippingAddress.state,
          city: order.shippingAddress.city,
          postalCode: order.shippingAddress.postalCode,
          weight: 1, // Default weight
          codAmount: order.paymentInfo.method === 'cod' ? order.total : 0
        }
      });
      setDeliveryOptions(response.data.options || []);
    } catch (error) {
      console.error('Error fetching delivery options:', error);
      toast({
        title: "Error",
        description: "Failed to fetch delivery options",
        variant: "destructive",
      });
    }
  };

  const assignDeliveryMethod = async () => {
    if (!selectedOrder || !selectedDeliveryMethod) {
      toast({
        title: "Error",
        description: "Please select both order and delivery method",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        deliveryMethod: selectedDeliveryMethod,
        adminNotes
      };

      if (selectedDeliveryMethod === 'delivery_company' && selectedDeliveryCompany) {
        payload.deliveryCompanyId = selectedDeliveryCompany;
      }

      await api.post(`/delivery-management/orders/${selectedOrder._id}/assign`, payload);
      
      toast({
        title: "Success",
        description: "Delivery method assigned successfully",
      });

      // Refresh data
      fetchPendingOrders();
      fetchAssignments();
      
      // Reset form
      setSelectedOrder(null);
      setSelectedDeliveryMethod('');
      setSelectedDeliveryCompany('');
      setAdminNotes('');
      
    } catch (error: any) {
      console.error('Error assigning delivery method:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign delivery method",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trackShipment = async (waybill: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/delivery-management/track/${waybill}`);
      setTrackingData(response.data);
    } catch (error: any) {
      console.error('Error tracking shipment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to track shipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryMethodIcon = (method: string) => {
    switch (method) {
      case 'delhivery':
        return <Truck className="h-4 w-4" />;
      case 'manual':
        return <Package className="h-4 w-4" />;
      default:
        return <Truck className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Management</h1>
          <p className="text-muted-foreground">Manage order deliveries and track shipments</p>
        </div>
        <Button onClick={() => { fetchPendingOrders(); fetchAssignments(); }} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Orders ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="assignments">Delivery Assignments ({assignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders Pending Delivery Assignment</CardTitle>
              <CardDescription>
                Orders that need delivery method assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders pending delivery assignment</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pendingOrders.map((order) => (
                      <Card key={order._id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">#{order.orderNumber}</Badge>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <div>
                              <p className="font-medium">
                                {order.user.firstName} {order.user.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{order.user.email}</p>
                              <p className="text-sm text-muted-foreground">{order.user.phone}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {order.shippingAddress.street}, {order.shippingAddress.area}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-lg font-bold">₹{order.total}</div>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedOrder(order);
                              fetchDeliveryOptions(order);
                            }}
                          >
                            Assign Delivery
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Assignments</CardTitle>
              <CardDescription>
                Orders with assigned delivery methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Delivery Method</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">#{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {order.user.firstName} {order.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{order.user.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeliveryMethodIcon(order.shipping.deliveryMethod || '')}
                            <span className="capitalize">
                              {order.shipping.deliveryCompanyName || order.shipping.deliveryMethod || 'Not assigned'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.shipping.trackingNumber ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{order.shipping.trackingNumber}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => trackShipment(order.shipping.trackingNumber!)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No tracking</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.shipping.assignedBy ? (
                            <span>
                              {order.shipping.assignedBy.firstName} {order.shipping.assignedBy.lastName}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setSelectedDeliveryMethod(order.shipping.deliveryMethod || '');
                              setSelectedDeliveryCompany(order.shipping.deliveryCompanyId || '');
                              setAdminNotes(order.shipping.adminNotes || '');
                              fetchDeliveryOptions(order);
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delivery Assignment Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Delivery Method</DialogTitle>
            <DialogDescription>
              Assign delivery method for order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="text-sm">
                    {selectedOrder.user.firstName} {selectedOrder.user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.user.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-lg font-bold">₹{selectedOrder.total}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {selectedOrder.paymentInfo.method}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Shipping Address</Label>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.area}
                  </p>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="space-y-4">
                <Label>Select Delivery Method</Label>
                <div className="grid gap-3">
                  {deliveryOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedDeliveryMethod === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedDeliveryMethod(option.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {option.isRecommended && (
                              <Badge variant="secondary" className="text-xs">
                                Recommended
                              </Badge>
                            )}
                            <span className="font-medium">{option.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Estimated: {option.estimatedDays} • Charges: ₹{option.charges}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">₹{option.charges}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add any notes about this delivery assignment..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={assignDeliveryMethod}
                  disabled={loading || !selectedDeliveryMethod}
                >
                  {loading ? 'Assigning...' : 'Assign Delivery'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tracking Dialog */}
      <Dialog open={!!trackingData} onOpenChange={() => setTrackingData(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Shipment Tracking</DialogTitle>
            <DialogDescription>
              Tracking information for waybill {trackingData?.waybill}
            </DialogDescription>
          </DialogHeader>
          
          {trackingData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Waybill Number</Label>
                  <p className="font-mono text-sm">{trackingData.waybill}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  <Badge className="ml-2">{trackingData.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Origin</Label>
                  <p className="text-sm">{trackingData.origin}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Destination</Label>
                  <p className="text-sm">{trackingData.destination}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estimated Delivery</Label>
                  <p className="text-sm">{trackingData.estimatedDelivery}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Location</Label>
                  <p className="text-sm">{trackingData.currentLocation}</p>
                </div>
              </div>

              {trackingData.scans && trackingData.scans.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Tracking History</Label>
                  <div className="space-y-2 mt-2">
                    {trackingData.scans.map((scan, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 border rounded">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{scan.status}</p>
                          <p className="text-xs text-muted-foreground">
                            {scan.location} • {new Date(scan.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


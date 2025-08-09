"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Search,
  Eye,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Calendar,
  Phone,
  User,
  Plus
} from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
// import { shippingService } from "@/lib/services";

interface ShippingOrder {
  _id: string;
  orderId: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  state: string;
  pincode: string;
  courierPartner: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  estimatedDelivery: string;
  actualDelivery?: string;
  shippingCost: number;
  weight: number;
  dimensions: string;
  createdAt: string;
  updatedAt: string;
}

export default function ShippingPage() {
  const [shipments, setShipments] = useState<ShippingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed'>('all');

  // Fetch real shipping data from backend
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        // Fetch real shipments from backend API
        // const response = await shippingService.getShipments();
        const response = [];

        if (response && Array.isArray(response)) {
          setShipments(response);
        } else if (response && Array.isArray(response.shipments)) {
          setShipments(response.shipments);
        } else {
          // No shipments found, show empty state
          setShipments([]);
        }
      } catch (error) {
        console.error('Failed to fetch shipments:', error);
        // Show empty state on error
        setShipments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);



  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.courierPartner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalShipments = shipments.length;
  const pendingShipments = shipments.filter(s => s.status === 'pending').length;
  const inTransitShipments = shipments.filter(s => s.status === 'in_transit' || s.status === 'picked_up' || s.status === 'out_for_delivery').length;
  const deliveredShipments = shipments.filter(s => s.status === 'delivered').length;
  const totalShippingCost = shipments.reduce((sum, s) => sum + s.shippingCost, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'picked_up': return <Package className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'out_for_delivery': return <Navigation className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case 'picked_up': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'failed': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (loading) {
    return (
      <AdminLayout currentPage="shipping">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Shipping Management</h1>
            <p className="text-muted-foreground">Loading shipping data...</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="shipping">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Shipping Management</h1>
            <p className="text-muted-foreground">Track and manage order deliveries and shipments.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Shipment
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
          <p className="text-2xl font-bold">{totalShipments}</p>
      </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Navigation className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">In Transit</p>
          <p className="text-2xl font-bold">{inTransitShipments}</p>
      </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">Delivered</p>
          <p className="text-2xl font-bold">{deliveredShipments}</p>
      </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">Shipping Cost</p>
          <p className="text-2xl font-bold">{formatCurrency(totalShippingCost)}</p>
      </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID, tracking number, customer, or courier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
        </div>
      </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All ({totalShipments})
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Pending ({pendingShipments})
              </Button>
              <Button
                variant={filterStatus === 'in_transit' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('in_transit')}
                size="sm"
              >
                In Transit ({inTransitShipments})
              </Button>
              <Button
                variant={filterStatus === 'delivered' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('delivered')}
                size="sm"
              >
                Delivered ({deliveredShipments})
              </Button>
        </div>
      </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shipment Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Order Details</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Delivery Address</th>
                  <th className="text-left p-4 font-medium">Courier</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Delivery</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((shipment) => (
                  <tr key={shipment._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
        <div>
                        <div className="font-medium text-gray-900">{shipment.orderId}</div>
                        <div className="text-sm text-gray-500">Tracking: {shipment.trackingNumber}</div>
                        <div className="text-sm text-gray-500">
                          {shipment.weight}kg • {shipment.dimensions}
        </div>
      </div>
                    </td>
                    <td className="p-4">
        <div>
                        <div className="font-medium">{shipment.customerName}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {shipment.customerPhone}
        </div>
      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                        <div className="text-sm">
                          <div>{shipment.deliveryAddress}</div>
                          <div className="text-gray-500">{shipment.city}, {shipment.state} - {shipment.pincode}</div>
        </div>
      </div>
                    </td>
                    <td className="p-4">
        <div>
                        <div className="font-medium">{shipment.courierPartner}</div>
                        <div className="text-sm text-gray-500">{formatCurrency(shipment.shippingCost)}</div>
        </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(shipment.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(shipment.status)}
                        {shipment.status.replace('_', ' ').charAt(0).toUpperCase() + shipment.status.replace('_', ' ').slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          Est: {formatDate(shipment.estimatedDelivery)}
        </div>
                        {shipment.actualDelivery && (
                          <div className="text-green-600 font-medium">
                            Delivered: {formatDate(shipment.actualDelivery)}
        </div>
                        )}
        </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" title="Track Shipment">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Update Status">
                          <Truck className="h-4 w-4" />
                        </Button>
        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredShipments.length === 0 && (
              <div className="text-center py-8">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No shipments found</h3>
          <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'No shipments to track at the moment.'}
                </p>
        </div>
            )}
        </div>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}

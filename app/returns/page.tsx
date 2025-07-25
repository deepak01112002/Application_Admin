"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/admin-layout";
import {
  RotateCcw,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Package,
  DollarSign,
  User,
  Calendar,
  MessageSquare,
  RefreshCw
} from "lucide-react";

interface ReturnRequest {
  _id: string;
  returnId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  productImage: string;
  quantity: number;
  originalPrice: number;
  refundAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'processing';
  requestDate: string;
  processedDate?: string;
  notes: string;
  images: string[];
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'refunded' | 'processing'>('all');

  // Fetch returns data from API
  useEffect(() => {
    const fetchReturns = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/returns');
        // const realReturns = await response.json();

        // For now, show no data
        const realReturns: ReturnRequest[] = [];

        setReturns(realReturns);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching returns:', error);
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = returnItem.returnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || returnItem.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalReturns = returns.length;
  const pendingReturns = returns.filter(r => r.status === 'pending').length;
  const approvedReturns = returns.filter(r => r.status === 'approved').length;
  const refundedReturns = returns.filter(r => r.status === 'refunded').length;
  const totalRefundAmount = returns.filter(r => r.status === 'refunded').reduce((sum, r) => sum + r.refundAmount, 0);

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
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'refunded': return <DollarSign className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'approved': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'rejected': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'refunded': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'processing': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (loading) {
  return (
      <AdminLayout currentPage="returns">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Returns Management</h1>
            <p className="text-muted-foreground">Loading returns data...</p>
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

      <AdminLayout currentPage="returns">
        <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Returns Management</h1>
            <p className="text-muted-foreground">Handle customer returns and refund requests.</p>
            </div>
          </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <RotateCcw className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
              <p className="text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold">{totalReturns}</p>
            </div>
          </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
              <p className="text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingReturns}</p>
            </div>
          </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
              <p className="text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedReturns}</p>
            </div>
          </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
              <p className="text-muted-foreground">Refunded</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRefundAmount)}</p>
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
                  placeholder="Search returns by ID, order number, customer, or product..."
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
                All ({totalReturns})
              </Button>
            <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Pending ({pendingReturns})
              </Button>
            <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('approved')}
                size="sm"
              >
                Approved ({approvedReturns})
              </Button>
            <Button
                variant={filterStatus === 'refunded' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('refunded')}
                size="sm"
              >
                Refunded ({refundedReturns})
              </Button>
        </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Return Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Return Details</th>
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map((returnItem) => (
                  <tr key={returnItem._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
            <div>
                        <div className="font-medium text-gray-900">{returnItem.returnId}</div>
                        <div className="text-sm text-gray-500">Order: {returnItem.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          Requested: {formatDate(returnItem.requestDate)}
            </div>
                        {returnItem.processedDate && (
                          <div className="text-sm text-gray-500">
                            Processed: {formatDate(returnItem.processedDate)}
            </div>
                        )}
            </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={returnItem.productImage}
                          alt={returnItem.productName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
            <div>
                          <div className="font-medium text-sm">{returnItem.productName}</div>
                          <div className="text-sm text-gray-500">Qty: {returnItem.quantity}</div>
                          <div className="text-sm text-gray-500">
                            Original: {formatCurrency(returnItem.originalPrice)}
            </div>
          </div>
        </div>
                    </td>
                    <td className="p-4">
            <div>
                        <div className="font-medium">{returnItem.customerName}</div>
                        <div className="text-sm text-gray-500">{returnItem.customerEmail}</div>
            </div>
                    </td>
                    <td className="p-4">
            <div>
                        <div className="font-medium">
                          {returnItem.refundAmount > 0
                            ? formatCurrency(returnItem.refundAmount)
                            : 'No refund'
                          }
            </div>
                        {returnItem.refundAmount > 0 && (
                          <div className="text-sm text-gray-500">Refund amount</div>
                        )}
            </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(returnItem.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(returnItem.status)}
                        {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
            <Button variant="outline" size="sm" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {returnItem.status === 'pending' && (
                          <>
            <Button variant="outline" size="sm" title="Approve Return" className="text-green-600">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
            <Button variant="outline" size="sm" title="Reject Return" className="text-red-600">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
            <Button variant="outline" size="sm" title="Add Note">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReturns.length === 0 && (
              <div className="text-center py-8">
                <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No returns found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'No return requests at the moment.'}
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

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminManagementService } from "@/lib/services";
import { toast } from "sonner";
import { Loader2, Search, Eye, Edit, Users, Mail, Phone, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  wallet?: {
    balance: number;
  };
  createdAt: string;
  lastLogin?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Enhanced features
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerSegment, setCustomerSegment] = useState<'all' | 'active' | 'inactive' | 'high-value'>('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [customerStats, setCustomerStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
    totalWalletBalance: 0,
    averageOrderValue: 0,
    topSpenders: [] as Customer[]
  });

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
        role: 'user' // Only get customers, not admin users
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await adminManagementService.getAllUsers(params);
      setCustomers(response.users || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load customers');
      console.error('Customers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomerStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      await adminManagementService.updateUserStatus(customerId, {
        isActive: !currentStatus
      });
      toast.success('Customer status updated successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to update customer status');
      console.error('Toggle error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Enhanced customer management functions
  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    const visibleCustomerIds = filteredCustomers.map(c => c._id);
    setSelectedCustomers(prev =>
      prev.length === visibleCustomerIds.length
        ? []
        : visibleCustomerIds
    );
  };

  const handleBulkStatusUpdate = async (status: boolean) => {
    if (selectedCustomers.length === 0) {
      toast.error('Please select customers to update');
      return;
    }

    try {
      const updatePromises = selectedCustomers.map(customerId =>
        adminManagementService.updateUserStatus(customerId, { isActive: true })
      );

      await Promise.all(updatePromises);
      toast.success(`Successfully updated ${selectedCustomers.length} customers`);
      setSelectedCustomers([]);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to update customers');
      console.error('Bulk update error:', error);
    }
  };

  const getCustomerSegment = (customer: Customer) => {
    const walletBalance = customer.wallet?.balance || 0;
    if (walletBalance > 10000) return 'high-value';
    if (customer.isActive) return 'active';
    return 'inactive';
  };

  // Filter customers based on segment
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesSegment = customerSegment === 'all' || getCustomerSegment(customer) === customerSegment;

    return matchesSearch && matchesSegment;
  });

  if (loading && customers.length === 0) {
    return (
      <AdminLayout currentPage="customers">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
      <AdminLayout currentPage="customers">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Customers Management</h1>
            <p className="text-muted-foreground">Manage your customer accounts and information.</p>
      </div>

      {/* Customer Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              {customers.filter(c => c.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Value Customers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {customers.filter(c => (c.wallet?.balance || 0) > 10000).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Wallet balance &gt; ₹10,000
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallet Balance</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(customers.reduce((sum, c) => sum + (c.wallet?.balance || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Phone className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {customers.filter(c => {
                const createdDate = new Date(c.createdAt);
                const now = new Date();
                return createdDate.getMonth() === now.getMonth() &&
                       createdDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={customerSegment}
                onChange={(e) => setCustomerSegment(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Customers</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="high-value">High Value</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setShowBulkActions(!showBulkActions)}
                disabled={selectedCustomers.length === 0}
              >
                Bulk Actions ({selectedCustomers.length})
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && selectedCustomers.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedCustomers.length} customers selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleBulkStatusUpdate(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Activate Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate(false)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Deactivate Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCustomers([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer._id)}
                      onChange={() => handleSelectCustomer(customer._id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {customer._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {customer.wallet?.balance 
                        ? formatCurrency(customer.wallet.balance)
                        : formatCurrency(0)
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.isActive ? "default" : "secondary"}>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {customer.lastLogin ? formatDate(customer.lastLogin) : 'Never'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(customer.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCustomerStatus(customer._id, customer.isActive)}
                      >
                        {customer.isActive ? (
                          <ToggleRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
        </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {customers.length === 0 && !loading && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No customers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? "Try adjusting your search" 
                  : "Customers will appear here once they register."}
              </p>
            </div>
          )}

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

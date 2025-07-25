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

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
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
              {customers.map((customer) => (
                <TableRow key={customer._id}>
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
                      {formatDate(customer.lastLogin)}
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

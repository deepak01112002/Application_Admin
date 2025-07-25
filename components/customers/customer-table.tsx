"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Users
} from "lucide-react";
import { useState, useEffect } from "react";
import { userService, Customer } from "@/lib/services";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";



const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "user":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getStatusColor = (isActive: boolean) => {
  return isActive 
    ? "bg-green-100 text-green-800 hover:bg-green-200"
    : "bg-red-100 text-red-800 hover:bg-red-200";
};

export function CustomerTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await userService.getUsers();
        console.log('Fetched customers:', data); // Debug log
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Customers error:', err);
        setError(err.message || 'Failed to load customers');
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    setDeleteLoading(true);
    try {
      await userService.deleteUser(selectedCustomer._id);
      setCustomers(customers.filter(c => c._id !== selectedCustomer._id));
      toast.success('Customer deleted successfully');
      setShowDeleteDialog(false);
      setSelectedCustomer(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete customer');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (customer: Customer) => {
    try {
      const updatedCustomer = await userService.updateUser(customer._id, {
        isActive: !customer.isActive
      });
      setCustomers(customers.map(c =>
        c._id === customer._id ? { ...c, isActive: !c.isActive } : c
      ));
      toast.success(`Customer ${!customer.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      console.error('Status update error:', err);
      toast.error(err.message || 'Failed to update customer status');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const customerName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown User';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === 'all' || customer.role === filterRole;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && customer.isActive !== false) ||
      (filterStatus === 'inactive' && customer.isActive === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading customers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Customers</h2>
            <p className="text-slate-600 mt-1">
              Manage your customer base ({filteredCustomers.length} of {customers.length} customers)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Customer Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No customers found</h3>
            <p className="text-slate-500">
              {searchTerm ? "Try adjusting your search criteria." : "Get started by adding your first customer."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredCustomers.map((customer) => (
              <div key={customer._id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
                        {(() => {
                          const customerName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown User';
                          return customerName.charAt(0).toUpperCase();
                        })()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown User'}
                        </h3>
                        <Badge className={getRoleColor(customer.role)}>
                          {customer.role}
                        </Badge>
                        <Badge className={getStatusColor(customer.isActive !== false)}>
                          {customer.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {formatDate(customer.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleToggleStatus(customer)}>
                          {customer.isActive !== false ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

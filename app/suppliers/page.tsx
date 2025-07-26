"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/admin-layout";
import {
  Building,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Package,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { supplierService } from "@/lib/services";

interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst: string;
  contactPerson: string;
  status: 'active' | 'inactive';
  totalOrders: number;
  totalAmount: number;
  lastOrderDate: string;
  createdAt: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Initialize current user (same as dashboard)
  useEffect(() => {
    setCurrentUser({
      name: "Admin User",
      email: "admin@ghanshyambhandar.com",
      avatar: null
    });
  }, []);

  // Navigation function (same as dashboard)
  const handleNavigate = (page: string) => {
    switch (page) {
      case "dashboard":
        window.location.href = "/";
        break;
      case "products":
        window.location.href = "/products";
        break;
      case "categories":
        window.location.href = "/categories";
        break;
      case "orders":
        window.location.href = "/orders";
        break;
      case "customers":
        window.location.href = "/customers";
        break;
      case "coupons":
        window.location.href = "/coupons";
        break;
      case "inventory":
        window.location.href = "/inventory";
        break;
      case "suppliers":
        window.location.href = "/suppliers";
        break;
      case "invoices":
        window.location.href = "/invoices";
        break;
      case "returns":
        window.location.href = "/returns";
        break;
      case "support":
        window.location.href = "/support";
        break;
      case "shipping":
        window.location.href = "/shipping";
        break;
      case "reports":
        window.location.href = "/reports";
        break;
      case "analytics":
        window.location.href = "/analytics";
        break;
      case "settings":
        window.location.href = "/settings";
        break;
      default:
        window.location.href = "/";
        break;
    }
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  // Sample data - Replace with API call
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        // Fetch real suppliers from backend
        const suppliersResponse = await supplierService.getAllSuppliers();

        if (suppliersResponse && Array.isArray(suppliersResponse)) {
          setSuppliers(suppliersResponse);
        } else {
          // No suppliers found, show empty state
          setSuppliers([]);
        }
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
        // Show empty state on error
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const totalOrders = suppliers.reduce((sum, s) => sum + s.totalOrders, 0);
  const totalAmount = suppliers.reduce((sum, s) => sum + s.totalAmount, 0);

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

  if (loading) {
    return (
      <AdminLayout currentPage="suppliers">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Suppliers Management</h1>
            <p className="text-muted-foreground">Loading suppliers data...</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>              <CardContent className="p-6">
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
    <AdminLayout currentPage="suppliers">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Suppliers Management</h1>
            <p className="text-muted-foreground">Manage your supplier relationships and orders.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Supplier
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
                  <p className="text-2xl font-bold">{totalSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Suppliers</p>
                  <p className="text-2xl font-bold">{activeSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
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
      placeholder="Search suppliers by name, email, or contact person..."
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
      All ({totalSuppliers})
      </Button>
            <Button
      variant={filterStatus === 'active' ? 'default' : 'outline'}
      onClick={() => setFilterStatus('active')}
      size="sm"
      >
      Active ({activeSuppliers})
      </Button>
            <Button
      variant={filterStatus === 'inactive' ? 'default' : 'outline'}
      onClick={() => setFilterStatus('inactive')}
      size="sm"
      >
      Inactive ({totalSuppliers - activeSuppliers})
      </Button>
        </div>
      </div>
      </CardContent>
      </Card>

      {/* Suppliers Table */}            <Card>
      <CardHeader>
      <CardTitle>Suppliers List</CardTitle>
      </CardHeader>              <CardContent>
      <div className="overflow-x-auto">
      <table className="w-full">
      <thead>
      <tr className="border-b">
      <th className="text-left p-4 font-medium">Supplier</th>
      <th className="text-left p-4 font-medium">Contact</th>
      <th className="text-left p-4 font-medium">Location</th>
      <th className="text-left p-4 font-medium">Orders</th>
      <th className="text-left p-4 font-medium">Total Value</th>
      <th className="text-left p-4 font-medium">Status</th>
      <th className="text-left p-4 font-medium">Actions</th>
      </tr>
      </thead>
      <tbody>
      {filteredSuppliers.map((supplier) => (
      <tr key={supplier._id} className="border-b hover:bg-gray-50">
      <td className="p-4">
            <div>
      <div className="font-medium text-gray-900">{supplier.name}</div>
      <div className="text-sm text-gray-500">GST: {supplier.gst}</div>
      <div className="text-sm text-gray-500">Contact: {supplier.contactPerson}</div>
      </div>
      </td>
      <td className="p-4">
      <div className="space-y-1">
      <div className="flex items-center text-sm">
      <Mail className="h-4 w-4 mr-2 text-gray-400" />
      {supplier.email}
      </div>
      <div className="flex items-center text-sm">
      <Phone className="h-4 w-4 mr-2 text-gray-400" />
      {supplier.phone}
      </div>
      </div>
      </td>
      <td className="p-4">
      <div className="flex items-start">
      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
      <div className="text-sm">
      <div>{supplier.city}, {supplier.state}</div>
      <div className="text-gray-500">{supplier.pincode}</div>
      </div>
      </div>
      </td>
      <td className="p-4">
      <div className="text-center">
      <div className="text-lg font-semibold">{supplier.totalOrders}</div>
      <div className="text-xs text-gray-500">
      Last: {formatDate(supplier.lastOrderDate)}
      </div>
      </div>
      </td>
      <td className="p-4">
      <div className="font-medium">{formatCurrency(supplier.totalAmount)}</div>
      </td>
      <td className="p-4">
      <Badge
      className={supplier.status === 'active'
      ? 'bg-green-100 text-green-800 hover:bg-green-100'
      : 'bg-red-100 text-red-800 hover:bg-red-100'
      }
      >
      {supplier.status === 'active' ? 'Active' : 'Inactive'}
      </Badge>
      </td>
      <td className="p-4">
      <div className="flex space-x-2">
            <Button variant="outline" size="sm" title="View Details">
      <Eye className="h-4 w-4" />
      </Button>
            <Button variant="outline" size="sm" title="Edit Supplier">
      <Edit className="h-4 w-4" />
      </Button>
            <Button variant="outline" size="sm" title="Delete Supplier">
      <Trash2 className="h-4 w-4" />
      </Button>
        </div>
      </td>
      </tr>
      ))}
      </tbody>
      </table>

      {filteredSuppliers.length === 0 && (
      <div className="text-center py-8">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No suppliers found</h3>
              <p className="mt-1 text-sm text-gray-500">
      {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first supplier.'}
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

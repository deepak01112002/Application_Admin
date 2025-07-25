"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/admin-layout";
import {
  Receipt,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from "lucide-react";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  issueDate: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue' | 'cancelled'>('all');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Initialize current user
  useEffect(() => {
    setCurrentUser({
      name: "Admin User",
      email: "admin@ghanshyambhandar.com",
      avatar: null
    });
  }, []);

  // Navigation function
  const handleNavigate = (page: string) => {
    switch (page) {
      case "dashboard": window.location.href = "/"; break;
      case "products": window.location.href = "/products"; break;
      case "categories": window.location.href = "/categories"; break;
      case "orders": window.location.href = "/orders"; break;
      case "customers": window.location.href = "/customers"; break;
      case "coupons": window.location.href = "/coupons"; break;
      case "inventory": window.location.href = "/inventory"; break;
      case "suppliers": window.location.href = "/suppliers"; break;
      case "invoices": window.location.href = "/invoices"; break;
      case "returns": window.location.href = "/returns"; break;
      case "support": window.location.href = "/support"; break;
      case "shipping": window.location.href = "/shipping"; break;
      case "reports": window.location.href = "/reports"; break;
      case "analytics": window.location.href = "/analytics"; break;
      case "settings": window.location.href = "/settings"; break;
      default: window.location.href = "/"; break;
    }
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  // Sample data - Replace with API call
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const sampleInvoices: Invoice[] = [
          {
            _id: "1",
            invoiceNumber: "INV-2025-001",
            customerName: "Rajesh Kumar",
            customerEmail: "rajesh@example.com",
            amount: 25000,
            tax: 4500,
            totalAmount: 29500,
            status: "paid",
            dueDate: "2025-02-15",
            issueDate: "2025-01-15",
            items: [
              { name: "iPhone 15 Pro", quantity: 1, price: 25000, total: 25000 }
            ],
            createdAt: "2025-01-15"
          },
          {
            _id: "2",
            invoiceNumber: "INV-2025-002",
            customerName: "Priya Sharma",
            customerEmail: "priya@example.com",
            amount: 15000,
            tax: 2700,
            totalAmount: 17700,
            status: "pending",
            dueDate: "2025-02-20",
            issueDate: "2025-01-20",
            items: [
              { name: "Samsung Galaxy S24", quantity: 1, price: 15000, total: 15000 }
            ],
            createdAt: "2025-01-20"
          },
          {
            _id: "3",
            invoiceNumber: "INV-2025-003",
            customerName: "Amit Singh",
            customerEmail: "amit@example.com",
            amount: 8000,
            tax: 1440,
            totalAmount: 9440,
            status: "overdue",
            dueDate: "2025-01-10",
            issueDate: "2024-12-10",
            items: [
              { name: "OnePlus 12", quantity: 1, price: 8000, total: 8000 }
            ],
            createdAt: "2024-12-10"
          },
          {
            _id: "4",
            invoiceNumber: "INV-2025-004",
            customerName: "Sunita Patel",
            customerEmail: "sunita@example.com",
            amount: 12000,
            tax: 2160,
            totalAmount: 14160,
            status: "pending",
            dueDate: "2025-02-25",
            issueDate: "2025-01-25",
            items: [
              { name: "Xiaomi 14", quantity: 1, price: 12000, total: 12000 }
            ],
            createdAt: "2025-01-25"
          },
          {
            _id: "5",
            invoiceNumber: "INV-2025-005",
            customerName: "Ravi Krishnan",
            customerEmail: "ravi@example.com",
            amount: 5000,
            tax: 900,
            totalAmount: 5900,
            status: "cancelled",
            dueDate: "2025-02-10",
            issueDate: "2025-01-10",
            items: [
              { name: "Realme GT 6", quantity: 1, price: 5000, total: 5000 }
            ],
            createdAt: "2025-01-10"
          }
        ];

        setInvoices(sampleInvoices);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.status === 'paid').length;
  const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
  const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0);

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
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'overdue': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'cancelled': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (loading) {
    return (
      <AdminLayout currentPage="invoices">
        <div className="space-y-6">
            <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Invoices Management</h1>
            <p className="text-muted-foreground">Loading invoices data...</p>
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
          </div>
        </main>
      </div>
    );
  }

  return (
      <AdminLayout currentPage="invoices">
        <div className="space-y-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
            <h1 className="text-3xl font-bold">Invoices Management</h1>
            <p className="text-muted-foreground">Manage invoices and billing operations.</p>
              </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{paidInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(paidAmount)}</p>
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
                  placeholder="Search invoices by number, customer name, or email..."
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
                All ({totalInvoices})
              </Button>
              <Button
                variant={filterStatus === 'paid' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('paid')}
                size="sm"
              >
                Paid ({paidInvoices})
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Pending ({pendingInvoices})
              </Button>
              <Button
                variant={filterStatus === 'overdue' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('overdue')}
                size="sm"
              >
                Overdue ({overdueInvoices})
              </Button>
        </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Invoice</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Due Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">
                          Issued: {formatDate(invoice.issueDate)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{invoice.customerName}</div>
                        <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{formatCurrency(invoice.totalAmount)}</div>
                        <div className="text-sm text-gray-500">
                          Tax: {formatCurrency(invoice.tax)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(invoice.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{formatDate(invoice.dueDate)}</div>
                        {invoice.status === 'overdue' && (
                          <div className="text-red-600 font-medium">Overdue</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" title="View Invoice">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Download PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Edit Invoice">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Delete Invoice">
                          <Trash2 className="h-4 w-4" />
                        </Button>
        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-8">
                <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No invoices found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first invoice.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

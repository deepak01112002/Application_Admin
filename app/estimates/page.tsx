"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  Eye, 
  Download, 
  FileText, 
  Calendar,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/lib/services";
import EstimateModal from "@/components/estimates/estimate-modal";
import EstimateFilters from "@/components/estimates/estimate-filters";

interface Estimate {
  _id: string;
  estimateNumber: string;
  estimateDate: string;
  validUntil: string;
  customerName: string;
  customerEmail: string;
  grandTotal: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  isExpired: boolean;
  isValid: boolean;
  userName: string;
  orderNumber?: string;
  convertedInvoice?: string;
  createdAt: string;
}

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [analytics, setAnalytics] = useState<any>(null);

  // Fetch estimates
  const fetchEstimates = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await adminService.get(`/estimates/admin/all?${params}`);
      
      if (response.success) {
        setEstimates(response.data.estimates);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
      }
    } catch (error) {
      console.error('Error fetching estimates:', error);
      toast.error('Failed to fetch estimates');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await adminService.get('/estimates/admin/analytics');
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchEstimates();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== "") {
        fetchEstimates(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  useEffect(() => {
    fetchEstimates(1);
  }, [statusFilter]);

  // Download estimate PDF
  const downloadEstimate = async (estimateId: string, format: 'standard' | 'thermal' | '4x6' = 'standard') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/estimates/${estimateId}/download?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Estimate-${format}-${estimateId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Estimate downloaded in ${format} format`);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading estimate:', error);
      toast.error('Failed to download estimate');
    }
  };

  // Convert estimate to invoice
  const convertToInvoice = async (estimateId: string) => {
    try {
      const response = await adminService.post(`/estimates/admin/${estimateId}/convert-to-invoice`);
      if (response.success) {
        toast.success('Estimate converted to invoice successfully');
        fetchEstimates(currentPage);
      }
    } catch (error) {
      console.error('Error converting estimate:', error);
      toast.error('Failed to convert estimate to invoice');
    }
  };

  // Update estimate status
  const updateStatus = async (estimateId: string, status: string) => {
    try {
      const response = await adminService.patch(`/estimates/admin/${estimateId}/status`, { status });
      if (response.success) {
        toast.success('Estimate status updated successfully');
        fetchEstimates(currentPage);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update estimate status');
    }
  };

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired && status !== 'converted') {
      return <Badge variant="destructive">Expired</Badge>;
    }

    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'sent':
        return <Badge variant="outline">Sent</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'converted':
        return <Badge variant="default" className="bg-blue-500">Converted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AdminLayout currentPage="estimates">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Estimates Management</h1>
            <p className="text-muted-foreground">Manage customer estimates and quotations</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Estimate
          </Button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Estimates</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.summary.totalEstimates}</div>
                <p className="text-xs text-muted-foreground">
                  ₹{analytics.summary.totalAmount?.toLocaleString()} total value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.summary.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.summary.convertedEstimates} converted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.summary.acceptanceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.summary.acceptedEstimates} accepted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Value</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{Math.round(analytics.summary.avgEstimateAmount || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Per estimate</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search estimates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardHeader>

          {showFilters && (
            <CardContent>
              <EstimateFilters onApplyFilters={(filters) => {
                // Apply advanced filters
                console.log('Filters applied:', filters);
              }} />
            </CardContent>
          )}
        </Card>

        {/* Estimates Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading estimates...
                    </TableCell>
                  </TableRow>
                ) : estimates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No estimates found
                    </TableCell>
                  </TableRow>
                ) : (
                  estimates.map((estimate) => (
                    <TableRow key={estimate._id}>
                      <TableCell className="font-medium">
                        {estimate.estimateNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{estimate.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {estimate.customerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(estimate.estimateDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className={estimate.isExpired ? 'text-red-500' : ''}>
                          {new Date(estimate.validUntil).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>₹{estimate.grandTotal.toLocaleString()}</TableCell>
                      <TableCell>
                        {getStatusBadge(estimate.status, estimate.isExpired)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEstimate(estimate);
                              setShowModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Download Dropdown */}
                          <Select onValueChange={(format) => downloadEstimate(estimate._id, format as any)}>
                            <SelectTrigger className="w-32">
                              <Download className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Download" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard PDF</SelectItem>
                              <SelectItem value="thermal">Thermal Print</SelectItem>
                              <SelectItem value="4x6">4x6 Format</SelectItem>
                            </SelectContent>
                          </Select>

                          {estimate.status === 'accepted' && !estimate.isExpired && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => convertToInvoice(estimate._id)}
                            >
                              Convert
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchEstimates(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => fetchEstimates(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Estimate Modal */}
      <EstimateModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEstimate(null);
        }}
        estimate={selectedEstimate}
        onSuccess={() => {
          fetchEstimates(currentPage);
          fetchAnalytics();
        }}
      />
    </AdminLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/admin-layout";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Eye,
  Filter
} from "lucide-react";
import { reportsService } from "@/lib/services";

interface ReportData {
  _id: string;
  reportType: string;
  title: string;
  description: string;
  period: string;
  generatedAt: string;
  status: 'ready' | 'generating' | 'failed';
  fileSize: string;
  downloadCount: number;
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    growthRate: number;
    conversionRate: number;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Fetch real reports data from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Try to fetch real reports from backend
        const reportsResponse = await reportsService.getSalesReport();

        // If we have real data, use it
        if (reportsResponse && Array.isArray(reportsResponse)) {
          setReports(reportsResponse);
        } else {
          // If no reports exist yet, show empty state
          setReports([]);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        // Show empty state on error
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [selectedPeriod]);



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getReportIcon = (reportType: string) => {
    switch (reportType) {
      case 'sales': return <DollarSign className="h-5 w-5" />;
      case 'inventory': return <Package className="h-5 w-5" />;
      case 'customer': return <Users className="h-5 w-5" />;
      case 'financial': return <BarChart3 className="h-5 w-5" />;
      case 'product': return <ShoppingCart className="h-5 w-5" />;
      case 'returns': return <TrendingDown className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'generating': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'failed': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const totalReports = reports.length;
  const readyReports = reports.filter(r => r.status === 'ready').length;
  const totalDownloads = reports.reduce((sum, r) => sum + r.downloadCount, 0);
  const totalRevenue = reports.filter(r => r.reportType === 'sales').reduce((sum, r) => sum + r.metrics.totalRevenue, 0);

  if (loading) {
    return (
      <AdminLayout currentPage="reports">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Loading reports data...</p>
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
    <AdminLayout currentPage="reports">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate and analyze business reports and insights.</p>
          </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
      </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
          <p className="text-2xl font-bold">{totalReports}</p>
      </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">Ready Reports</p>
          <p className="text-2xl font-bold">{readyReports}</p>
      </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">Downloads</p>
          <p className="text-2xl font-bold">{totalDownloads}</p>
      </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">Revenue Tracked</p>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
      </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getReportIcon(report.reportType)}
        </div>
        <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{report.period}</p>
      </div>
                </div>
                <Badge className={getStatusColor(report.status)}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </Badge>
        </div>
            </CardHeader>
            <CardContent>
          <p className="text-sm text-gray-600 mb-4">{report.description}</p>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {report.metrics.totalRevenue !== 0 && (
        <div>
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="font-semibold text-sm">{formatCurrency(report.metrics.totalRevenue)}</p>
      </div>
                )}
                {report.metrics.totalOrders !== 0 && (
        <div>
          <p className="text-xs text-gray-500">Orders</p>
          <p className="font-semibold text-sm">{report.metrics.totalOrders}</p>
      </div>
                )}
                {report.metrics.totalCustomers !== 0 && (
        <div>
          <p className="text-xs text-gray-500">Customers</p>
          <p className="font-semibold text-sm">{report.metrics.totalCustomers}</p>
      </div>
                )}
                {report.metrics.growthRate !== 0 && (
        <div>
          <p className="text-xs text-gray-500">Growth</p>
          <p className={`font-semibold text-sm flex items-center ${report.metrics.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {report.metrics.growthRate > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {Math.abs(report.metrics.growthRate)}%
                    </p>
        </div>
                )}
        </div>

              {/* Report Details */}
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Generated: {formatDate(report.generatedAt)}</span>
                <span>Size: {report.fileSize}</span>
        </div>

              {report.downloadCount > 0 && (
                <div className="text-sm text-gray-500 mb-4">
                  Downloaded {report.downloadCount} times
        </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {report.status === 'ready' && (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </>
                )}
                {report.status === 'generating' && (
                  <Button variant="outline" size="sm" className="flex-1" disabled>
                    Generating...
                  </Button>
                )}
                {report.status === 'failed' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Retry Generation
                  </Button>
                )}
        </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </AdminLayout>
  );
}

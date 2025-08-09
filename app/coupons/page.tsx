"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { couponService, adminManagementService } from "@/lib/services";
import { toast } from "sonner";
import { Loader2, Search, Eye, Edit, Tag, Plus, ToggleLeft, ToggleRight, Percent } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, [searchTerm]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponService.getCoupons();
      let filteredCoupons = [];

      // Ensure we have an array
      if (Array.isArray(response)) {
        filteredCoupons = response;
      } else if (response && typeof response === 'object' && 'coupons' in response && Array.isArray((response as any).coupons)) {
        filteredCoupons = (response as any).coupons;
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
        filteredCoupons = (response as any).data;
      }

      if (searchTerm && filteredCoupons.length > 0) {
        filteredCoupons = filteredCoupons.filter((coupon: Coupon) =>
          coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setCoupons(filteredCoupons);
    } catch (error) {
      toast.error('Failed to load coupons');
      console.error('Coupons error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCouponStatus = async (couponId: string) => {
    try {
      await adminManagementService.toggleCouponStatus(couponId);
      toast.success('Coupon status updated successfully');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update coupon status');
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <AdminLayout currentPage="coupons">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
      <AdminLayout currentPage="coupons">
        <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Coupons Management</h1>
            <p className="text-muted-foreground">Create and manage discount coupons.</p>
        </div>
          <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
        </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coupons ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coupon</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-orange-100 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium font-mono text-lg">{coupon.code}</div>
                        <div className="text-sm text-muted-foreground">
                          {coupon.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        <span className="font-medium">
                          {coupon.discountType === 'percentage' 
                            ? `${coupon.discountValue}%` 
                            : formatCurrency(coupon.discountValue)
                          }
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Min: {formatCurrency(coupon.minOrderAmount || 0)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full" 
                          style={{ 
                            width: coupon.usageLimit 
                              ? `${Math.min(100, ((coupon.usedCount || 0) / coupon.usageLimit) * 100)}%`
                              : '0%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>From: {formatDate(coupon.validFrom)}</div>
                      <div>Until: {formatDate(coupon.validUntil)}</div>
                      {isExpired(coupon.validUntil) && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive && !isExpired(coupon.validUntil) ? "default" : "secondary"}>
                      {coupon.isActive ? (isExpired(coupon.validUntil) ? 'Expired' : 'Active') : 'Inactive'}
                    </Badge>
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
                        onClick={() => toggleCouponStatus(coupon._id)}
                        disabled={isExpired(coupon.validUntil)}
                      >
                        {coupon.isActive ? (
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

          {coupons.length === 0 && !loading && (
            <div className="text-center py-8">
              <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No coupons found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? "Try adjusting your search" 
                  : "Create your first coupon to offer discounts to customers."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}

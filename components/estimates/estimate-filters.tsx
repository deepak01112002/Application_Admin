"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar,
  X,
  Filter,
  RefreshCw
} from "lucide-react";

interface EstimateFiltersProps {
  onApplyFilters: (filters: any) => void;
}

export default function EstimateFilters({ onApplyFilters }: EstimateFiltersProps) {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    status: [] as string[],
    taxType: '',
    isExpired: false,
    sortBy: 'estimateDate',
    sortOrder: 'desc'
  });

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
    { value: 'converted', label: 'Converted' }
  ];

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setFilters(prev => ({
        ...prev,
        status: [...prev.status, status]
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        status: prev.status.filter(s => s !== status)
      }));
    }
  };

  const removeStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.filter(s => s !== status)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      status: [],
      taxType: '',
      isExpired: false,
      sortBy: 'estimateDate',
      sortOrder: 'desc'
    });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Filters
        </h3>
        <Button variant="outline" size="sm" onClick={clearAllFilters}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="space-y-2">
            <div>
              <Label htmlFor="startDate" className="text-xs text-muted-foreground">From</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-xs text-muted-foreground">To</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Amount Range</Label>
          <div className="space-y-2">
            <div>
              <Label htmlFor="minAmount" className="text-xs text-muted-foreground">Min Amount</Label>
              <Input
                id="minAmount"
                type="number"
                placeholder="₹0"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="maxAmount" className="text-xs text-muted-foreground">Max Amount</Label>
              <Input
                id="maxAmount"
                type="number"
                placeholder="₹10000"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Tax Type & Options */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tax & Options</Label>
          <div className="space-y-2">
            <div>
              <Label htmlFor="taxType" className="text-xs text-muted-foreground">Tax Type</Label>
              <Select value={filters.taxType} onValueChange={(value) => setFilters(prev => ({ ...prev, taxType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tax Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tax Types</SelectItem>
                  <SelectItem value="GST">GST</SelectItem>
                  <SelectItem value="IGST">IGST</SelectItem>
                  <SelectItem value="NON_GST">Non-GST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isExpired"
                checked={filters.isExpired}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isExpired: checked as boolean }))}
              />
              <Label htmlFor="isExpired" className="text-xs">Show only expired</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Status</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${option.value}`}
                checked={filters.status.includes(option.value)}
                onCheckedChange={(checked) => handleStatusChange(option.value, checked as boolean)}
              />
              <Label htmlFor={`status-${option.value}`} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        
        {/* Selected Status Badges */}
        {filters.status.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.status.map((status) => (
              <Badge key={status} variant="secondary" className="flex items-center gap-1">
                {statusOptions.find(opt => opt.value === status)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeStatusFilter(status)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Sorting */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sortBy" className="text-sm font-medium">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="estimateDate">Estimate Date</SelectItem>
              <SelectItem value="grandTotal">Amount</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="customerName">Customer Name</SelectItem>
              <SelectItem value="validUntil">Valid Until</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sortOrder" className="text-sm font-medium">Sort Order</Label>
          <Select value={filters.sortOrder} onValueChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Apply Filters Button */}
      <div className="flex justify-end">
        <Button onClick={applyFilters} className="w-full md:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>
      </div>

      {/* Active Filters Summary */}
      <div className="text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-2">
          {filters.startDate && (
            <span>From: {new Date(filters.startDate).toLocaleDateString()}</span>
          )}
          {filters.endDate && (
            <span>To: {new Date(filters.endDate).toLocaleDateString()}</span>
          )}
          {filters.minAmount && (
            <span>Min: ₹{filters.minAmount}</span>
          )}
          {filters.maxAmount && (
            <span>Max: ₹{filters.maxAmount}</span>
          )}
          {filters.taxType && (
            <span>Tax: {filters.taxType}</span>
          )}
          {filters.isExpired && (
            <span>Expired Only</span>
          )}
        </div>
      </div>
    </div>
  );
}

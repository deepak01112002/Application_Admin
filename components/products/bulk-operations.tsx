"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  Package, 
  Tag,
  Download,
  Upload,
  Copy,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface BulkOperationsProps {
  selectedProducts: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
  categories: Array<{ _id: string; name: string; }>;
}

export function BulkOperations({ 
  selectedProducts, 
  onClearSelection, 
  onRefresh,
  categories 
}: BulkOperationsProps) {
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    category: '',
    price: '',
    discount: '',
    status: '',
    featured: '',
    tags: ''
  });

  const handleBulkEdit = async () => {
    try {
      setLoading(true);
      
      const updateData: any = {};
      if (bulkEditData.category) updateData.category = bulkEditData.category;
      if (bulkEditData.price) updateData.price = parseFloat(bulkEditData.price);
      if (bulkEditData.discount) updateData.discount_percentage = parseFloat(bulkEditData.discount);
      if (bulkEditData.status) updateData.isActive = bulkEditData.status === 'active';
      if (bulkEditData.featured) updateData.isFeatured = bulkEditData.featured === 'true';
      if (bulkEditData.tags) updateData.tags = bulkEditData.tags.split(',').map(tag => tag.trim());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/bulk-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          productIds: selectedProducts,
          updateData
        })
      });

      if (response.ok) {
        toast.success(`${selectedProducts.length} products updated successfully`);
        setShowBulkEditModal(false);
        setBulkEditData({
          category: '',
          price: '',
          discount: '',
          status: '',
          featured: '',
          tags: ''
        });
        onClearSelection();
        onRefresh();
      } else {
        throw new Error('Failed to update products');
      }
    } catch (error) {
      toast.error('Failed to update products');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          productIds: selectedProducts
        })
      });

      if (response.ok) {
        toast.success(`${selectedProducts.length} products deleted successfully`);
        setShowDeleteConfirm(false);
        onClearSelection();
        onRefresh();
      } else {
        throw new Error('Failed to delete products');
      }
    } catch (error) {
      toast.error('Failed to delete products');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/bulk-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          productIds: selectedProducts,
          updateData: { isActive: status === 'active' }
        })
      });

      if (response.ok) {
        toast.success(`${selectedProducts.length} products ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
        onClearSelection();
        onRefresh();
      } else {
        throw new Error('Failed to update product status');
      }
    } catch (error) {
      toast.error('Failed to update product status');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSelected = () => {
    // Create CSV export of selected products
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Price,Category,Status,Featured\n" +
      selectedProducts.map(id => `${id},Product Name,Price,Category,Status,Featured`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Products exported successfully');
  };

  const handleDuplicateProducts = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/bulk-duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          productIds: selectedProducts
        })
      });

      if (response.ok) {
        toast.success(`${selectedProducts.length} products duplicated successfully`);
        onClearSelection();
        onRefresh();
      } else {
        throw new Error('Failed to duplicate products');
      }
    } catch (error) {
      toast.error('Failed to duplicate products');
    } finally {
      setLoading(false);
    }
  };

  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedProducts.length} selected</Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear selection
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Edit className="w-4 h-4 mr-2" />
                )}
                Bulk Actions
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => setShowBulkEditModal(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusChange('active')}>
                <Eye className="w-4 h-4 mr-2" />
                Activate All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusChange('inactive')}>
                <EyeOff className="w-4 h-4 mr-2" />
                Deactivate All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicateProducts}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate Selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportSelected}>
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bulk Edit Modal */}
      <Dialog open={showBulkEditModal} onOpenChange={setShowBulkEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Edit Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={bulkEditData.category} onValueChange={(value) => setBulkEditData({...bulkEditData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Price</Label>
              <Input
                type="number"
                placeholder="New price (optional)"
                value={bulkEditData.price}
                onChange={(e) => setBulkEditData({...bulkEditData, price: e.target.value})}
              />
            </div>

            <div>
              <Label>Discount %</Label>
              <Input
                type="number"
                placeholder="Discount percentage (optional)"
                value={bulkEditData.discount}
                onChange={(e) => setBulkEditData({...bulkEditData, discount: e.target.value})}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={bulkEditData.status} onValueChange={(value) => setBulkEditData({...bulkEditData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Featured</Label>
              <Select value={bulkEditData.featured} onValueChange={(value) => setBulkEditData({...bulkEditData, featured: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Set featured status (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Featured</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <Input
                placeholder="Tags (comma separated, optional)"
                value={bulkEditData.tags}
                onChange={(e) => setBulkEditData({...bulkEditData, tags: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEdit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Products</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {selectedProducts.length} selected products? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { categoryService, adminManagementService } from "@/lib/services";
import { toast } from "sonner";
import { Loader2, Search, Eye, Edit, FolderOpen, Plus, ToggleLeft, ToggleRight, Trash2, QrCode, Download } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AddCategoryForm } from "@/components/categories/add-category-form";
import { EditCategoryForm } from "@/components/categories/edit-category-form";

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  isActive?: boolean;
  productCount?: number;
  product_count?: number;
  createdAt?: string;
  created_at?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      console.log('Categories API response:', response);

      // Handle different response structures
      let categoriesData: any[] = [];
      if (response) {
        categoriesData = (response as any).categories || (response as any).data || response || [];
      }

      // Ensure we have an array
      if (!Array.isArray(categoriesData)) {
        categoriesData = [];
      }

      // Normalize field names
      const normalizedCategories = categoriesData.map((category: any) => ({
        ...category,
        productCount: category.product_count || category.productCount || 0,
        createdAt: category.created_at || category.createdAt,
        isActive: category.isActive !== undefined ? category.isActive : true
      }));

      let filteredCategories = normalizedCategories;

      if (searchTerm) {
        filteredCategories = categoriesData.filter((category: Category) =>
          category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      console.log('Filtered categories:', filteredCategories);
      setCategories(filteredCategories);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error('Categories error:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setDeleting(categoryId);
      await categoryService.deleteCategory(categoryId);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
      console.error('Delete error:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      await categoryService.updateCategory(categoryId, { isActive: !currentStatus } as any);
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update category status');
      console.error('Toggle status error:', error);
    }
  };

  const handleCategoryAdded = () => {
    setShowAddModal(false);
    fetchCategories();
    toast.success('Category added successfully');
  };

  const handleCategoryUpdated = () => {
    setShowEditModal(false);
    setEditingCategory(null);
    fetchCategories();
    toast.success('Category updated successfully');
  };

  const toggleCategoryStatus = async (categoryId: string) => {
    try {
      await adminManagementService.toggleCategoryStatus(categoryId);
      toast.success('Category status updated successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update category status');
      console.error('Toggle error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generateCategoryQR = async (categoryId: string) => {
    try {
      setGeneratingQR(categoryId);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('adminToken');

      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr-codes/category/${categoryId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      setQrCodeData(data);
      setShowQRModal(true);
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setGeneratingQR(null);
    }
  };

  const generateAllCategoryQRs = async () => {
    try {
      setGeneratingQR('all');
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('adminToken');

      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr-codes/categories/all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR codes');
      }

      const data = await response.json();
      toast.success(`Generated QR codes for ${data.results.filter((r: any) => !r.error).length} categories!`);
    } catch (error) {
      console.error('Error generating QR codes:', error);
      toast.error('Failed to generate QR codes');
    } finally {
      setGeneratingQR(null);
    }
  };

  const downloadQRCode = (downloadUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded successfully!');
  };

  const printQRCode = (qrCodeData: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${qrCodeData.category.name}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
                margin: 0;
              }
              .qr-container {
                display: inline-block;
                border: 2px solid #000;
                padding: 20px;
                margin: 20px;
              }
              .qr-code {
                max-width: 300px;
                height: auto;
              }
              .category-info {
                margin-top: 15px;
                font-size: 16px;
                font-weight: bold;
              }
              .company-info {
                margin-top: 10px;
                font-size: 12px;
                color: #666;
              }
              @media print {
                body { margin: 0; }
                .qr-container {
                  border: 2px solid #000;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <img src="${qrCodeData.qrCode.dataURL}" alt="QR Code" class="qr-code" />
              <div class="category-info">${qrCodeData.category.name}</div>
              <div class="company-info">GHANSHYAM MURTI BHANDAR</div>
              <div class="company-info">Category QR Code</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      toast.success('QR code sent to printer!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
      <AdminLayout currentPage="categories">
        <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Categories Management</h1>
            <p className="text-muted-foreground">Organize your products with categories.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateAllCategoryQRs}
              disabled={generatingQR === 'all'}
            >
              {generatingQR === 'all' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4 mr-2" />
              )}
              Generate All QR Codes
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <FolderOpen className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {category.productCount || 0} products
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {category.createdAt ? formatDate(category.createdAt) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateCategoryQR(category._id)}
                        disabled={generatingQR === category._id}
                        title="Generate QR Code"
                      >
                        {generatingQR === category._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <QrCode className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(category._id, category.isActive ?? true)}
                      >
                        {category.isActive ? (
                          <ToggleRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category._id)}
                        disabled={deleting === category._id}
                      >
                        {deleting === category._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </Button>
        </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {categories.length === 0 && !loading && (
            <div className="text-center py-8">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No categories found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? "Try adjusting your search" 
                  : "Get started by creating your first category."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Add Category Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <AddCategoryForm
            onClose={() => setShowAddModal(false)}
            onCategoryAdded={handleCategoryAdded}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <EditCategoryForm
              category={editingCategory as any}
              onClose={() => {
                setShowEditModal(false);
                setEditingCategory(null);
              }}
              onCategoryUpdated={handleCategoryUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Category QR Code</DialogTitle>
          </DialogHeader>
          {qrCodeData && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={qrCodeData.qrCode.dataURL}
                  alt="Category QR Code"
                  className="mx-auto border border-gray-300 rounded"
                />
              </div>
              <div className="text-center">
                <h3 className="font-medium">{qrCodeData.category.name}</h3>
                <p className="text-sm text-gray-600">Category QR Code</p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => downloadQRCode(qrCodeData.qrCode.downloadUrl, `category-qr-${qrCodeData.category.name}.png`)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => printQRCode(qrCodeData)}
                  className="flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

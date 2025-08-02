"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { productService, adminManagementService } from "@/lib/services";
import { toast } from "sonner";
import { Loader2, Search, Eye, Edit, Package, Plus, ToggleLeft, ToggleRight, Trash2, QrCode, Download, Upload } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { BulkUploadModal } from "@/components/products/bulk-upload-modal";
import { AddProductForm } from "@/components/products/add-product-form";
import { EditProductForm } from "@/components/products/edit-product-form";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: {
    name: string;
  };
  images: string[];
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await productService.getProducts(params);
      console.log('Products API response:', response);

      // Handle different response structures
      let productsData = response.products || response.data?.products || [];

      // Normalize field names
      const normalizedProducts = productsData.map((product: any) => ({
        ...product,
        isActive: product.is_active !== undefined ? product.is_active : product.isActive !== undefined ? product.isActive : true,
        createdAt: product.created_at || product.createdAt
      }));

      setProducts(normalizedProducts);
      setTotalPages(response.pagination?.totalPages || response.data?.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load products');
      console.error('Products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (productId: string) => {
    try {
      await adminManagementService.toggleProductStatus(productId);
      toast.success('Product status updated successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product status');
      console.error('Toggle error:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setDeleting(productId);
      await productService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Delete error:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      await productService.updateProduct(productId, { isActive: !currentStatus } as any);
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product status');
      console.error('Toggle status error:', error);
    }
  };

  const handleProductAdded = () => {
    setShowAddModal(false);
    fetchProducts();
    toast.success('Product added successfully');
  };

  const handleBulkUploadSuccess = () => {
    setShowBulkUploadModal(false);
    fetchProducts();
    toast.success('Bulk upload completed successfully');
  };

  const handleProductUpdated = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    fetchProducts();
    toast.success('Product updated successfully');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const generateProductQR = async (productId: string) => {
    try {
      setGeneratingQR(productId);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('adminToken');

      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr-codes/product/${productId}`, {
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

  const generateAllProductQRs = async () => {
    try {
      setGeneratingQR('all');
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('adminToken');

      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr-codes/products/all`, {
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
      toast.success(`Generated QR codes for ${data.results.filter((r: any) => !r.error).length} products!`);
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
            <title>Print QR Code - ${qrCodeData.product.name}</title>
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
              .product-info {
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
              <div class="product-info">${qrCodeData.product.name}</div>
              <div class="company-info">GHANSHYAM MURTI BHANDAR</div>
              <div class="company-info">Product QR Code</div>
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

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
      <AdminLayout currentPage="products">
        <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Products Management</h1>
            <p className="text-muted-foreground">Manage your product catalog.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateAllProductQRs}
              disabled={generatingQR === 'all'}
            >
              {generatingQR === 'all' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4 mr-2" />
              )}
              Generate All QR Codes
            </Button>
            <Button variant="outline" onClick={() => setShowBulkUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.category?.name || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(product.price)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                      {product.stock} units
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateProductQR(product._id)}
                        disabled={generatingQR === product._id}
                        title="Generate QR Code"
                      >
                        {generatingQR === product._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <QrCode className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(product._id, product.isActive ?? true)}
                      >
                        {product.isActive ? (
                          <ToggleRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product._id)}
                        disabled={deleting === product._id}
                      >
                        {deleting === product._id ? (
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

          {products.length === 0 && !loading && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? "Try adjusting your search" 
                  : "Get started by adding your first product."}
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

      {/* Add Product Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <AddProductForm
            onClose={() => setShowAddModal(false)}
            onProductAdded={handleProductAdded}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <EditProductForm
              product={editingProduct as any}
              onClose={() => {
                setShowEditModal(false);
                setEditingProduct(null);
              }}
              onProductUpdated={handleProductUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Product QR Code</DialogTitle>
          </DialogHeader>
          {qrCodeData && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={qrCodeData.qrCode.dataURL}
                  alt="Product QR Code"
                  className="mx-auto border border-gray-300 rounded"
                />
              </div>
              <div className="text-center">
                <h3 className="font-medium">{qrCodeData.product.name}</h3>
                <p className="text-sm text-gray-600">Product QR Code</p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => downloadQRCode(qrCodeData.qrCode.downloadUrl, `product-qr-${qrCodeData.product.name}.png`)}
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

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onSuccess={handleBulkUploadSuccess}
      />
    </AdminLayout>
  );
}

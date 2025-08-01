"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { productService } from "@/lib/services";
import { toast } from "sonner";
import {
  Warehouse,
  Search,
  Edit,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Loader2,
  Plus,
  Minus
} from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";

interface Product {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  category: {
    name: string;
  };
  images: string[];
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await productService.getProducts(params);
      console.log('Inventory products response:', response);

      // Handle different response structures
      let productsData = response.products || response.data?.products || [];

      // Normalize field names
      const normalizedProducts = productsData.map((product: any) => ({
        ...product,
        isActive: product.is_active !== undefined ? product.is_active : product.isActive !== undefined ? product.isActive : true,
        createdAt: product.created_at || product.createdAt
      }));

      setProducts(normalizedProducts);
    } catch (error) {
      toast.error('Failed to load inventory');
      console.error('Inventory error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!editingProduct) return;

    try {
      setUpdating(true);
      await productService.updateInventory(editingProduct._id, newStock);
      toast.success('Stock updated successfully');
      setShowStockModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update stock');
      console.error('Stock update error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const openStockModal = (product: Product) => {
    setEditingProduct(product);
    setNewStock(product.stock);
    setShowStockModal(true);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    if (stock < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: TrendingDown };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: TrendingUp };
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate inventory stats
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stock > 0).length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

  if (loading) {
    return (
      <AdminLayout currentPage="inventory">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
      <AdminLayout currentPage="inventory">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">Track and manage your product inventory and stock levels.</p>
        </div>

        {/* Inventory Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Products in catalog
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{inStockProducts}</div>
              <p className="text-xs text-muted-foreground">
                Products available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
              <p className="text-xs text-muted-foreground">
                Need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
              <p className="text-xs text-muted-foreground">
                Urgent attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Product Inventory ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  const StockIcon = stockStatus.icon;

                  return (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.images && product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {product.sku || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>{product.category?.name || 'Uncategorized'}</TableCell>
                      <TableCell>
                        <div className="font-medium">{product.stock}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          <StockIcon className="w-3 h-3 mr-1" />
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{product.price?.toLocaleString() || '0'}</TableCell>
                      <TableCell>₹{((product.stock || 0) * (product.price || 0)).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStockModal(product)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Update Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? "No products found matching your search"
                            : "No products available in inventory"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Stock Update Modal */}
        <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Stock - {editingProduct?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  value={editingProduct?.stock || 0}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="newStock">New Stock Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewStock(Math.max(0, newStock - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    id="newStock"
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    min="0"
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewStock(newStock + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
        </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowStockModal(false)}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStock}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Stock'
                  )}
                </Button>
        </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

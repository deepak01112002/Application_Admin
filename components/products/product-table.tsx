"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  MoreHorizontal,
  Star,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";
import { productService } from "@/lib/services";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Product {
  id: string;
  _id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  price: number;
  original_price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

const getStatusColor = (product: Product) => {
  if (!product.is_active) {
    return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
  if (product.stock === 0) {
    return "bg-red-100 text-red-800 hover:bg-red-200";
  }
  if (product.stock < 10) {
    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
  }
  return "bg-green-100 text-green-800 hover:bg-green-200";
};

const getStatusText = (product: Product) => {
  if (!product.is_active) return "Inactive";
  if (product.stock === 0) return "Out of Stock";
  if (product.stock < 10) return "Low Stock";
  return "Active";
};

interface ProductTableProps {
  onAddProduct: () => void;
  onEditProduct?: (product: Product) => void;
}

export function ProductTable({ onAddProduct, onEditProduct }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'low-stock'>('all');
  const [showViewDialog, setShowViewDialog] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await productService.getProducts({ page: 1, limit: 50 });
        console.log('Fetched products response:', response); // Debug log

        // Handle different response formats
        if (response.products) {
          setProducts(response.products);
        } else if (Array.isArray(response)) {
          setProducts(response);
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        console.error('Products error:', err);
        setError(err.message || 'Failed to load products');
        toast.error('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    setDeleteLoading(true);
    try {
      await productService.deleteProduct(selectedProduct._id);
      setProducts(products.filter(p => p._id !== selectedProduct._id));
      toast.success('Product deleted successfully');
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('category', product.category.id);
      formData.append('price', product.price.toString());
      formData.append('originalPrice', product.original_price.toString());
      formData.append('stock', product.stock.toString());
      formData.append('isActive', (!product.is_active).toString());
      formData.append('isFeatured', (product.is_featured || false).toString());

      await productService.updateProduct(product._id, formData);

      // Update the product in the list
      setProducts(products.map(p =>
        p._id === product._id ? { ...p, is_active: !p.is_active } : p
      ));
      toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      console.error('Status update error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update product status';
      toast.error(errorMessage);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && product.is_active) ||
      (filterStatus === 'inactive' && !product.is_active) ||
      (filterStatus === 'low-stock' && product.stock < 10);

    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Products</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={onAddProduct} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-2 border-b">
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-600 text-center py-4">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Stock</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="border-b">
                      <td className="p-2">
                        <div className="flex items-center space-x-3">
                          <ImageWithFallback
                            src={product.images && product.images.length > 0 ? product.images[0] : undefined}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                            fallbackClassName="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center"
                            fallbackContent={<div className="w-8 h-8 bg-gray-300 rounded"></div>}
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {product._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">{product && product.category && product.category.name}</td>
                      <td className="p-2 font-medium">₹{(product.price || 0).toLocaleString()}</td>
                      <td className="p-2">{product.stock}</td>
                      <td className="p-2">
                        <Badge className={getStatusColor(product)}>
                          {getStatusText(product)}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowViewDialog(true);
                            }}
                            title="View Product"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditProduct && onEditProduct(product)}
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteDialog(true);
                            }}
                            title="Delete Product"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* View Product Dialog */}
      <AlertDialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Product Details</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg font-semibold">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-lg">{selectedProduct.category.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Price</label>
                  <p className="text-lg font-semibold text-green-600">₹{selectedProduct.price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Stock</label>
                  <p className="text-lg">{selectedProduct.stock} units</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className={getStatusColor(selectedProduct)}>
                    {getStatusText(selectedProduct)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Featured</label>
                  <p className="text-lg">{selectedProduct.is_featured ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-800 mt-1">{selectedProduct.description}</p>
              </div>
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Images</label>
                  <div className="flex space-x-2 mt-2">
                    {selectedProduct.images.slice(0, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>



      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
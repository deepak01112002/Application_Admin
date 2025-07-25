"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package, AlertTriangle, CheckCircle, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { productService } from "@/lib/services";
import ImageWithFallback from "@/components/ui/image-with-fallback";

interface InventoryItem {
  id: string;
  _id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  stock: number;
  price: number;
  is_active: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
}

const getStockStatus = (stock: number, isActive: boolean) => {
  if (!isActive) return { status: "inactive", color: "bg-gray-100 text-gray-800" };
  if (stock === 0) return { status: "out-of-stock", color: "bg-red-100 text-red-800" };
  if (stock < 10) return { status: "low-stock", color: "bg-yellow-100 text-yellow-800" };
  return { status: "in-stock", color: "bg-green-100 text-green-800" };
};

const getStockIcon = (stock: number, isActive: boolean) => {
  if (!isActive) return Package;
  if (stock === 0) return AlertTriangle;
  if (stock < 10) return AlertTriangle;
  return CheckCircle;
};

export function InventoryTable() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await productService.getProducts({ page: 1, limit: 100 });
        console.log('Inventory response:', response); // Debug log

        // Handle different response formats
        if (response.products) {
          setInventory(response.products);
        } else if (Array.isArray(response)) {
          setInventory(response);
        } else {
          setInventory([]);
        }
      } catch (err: any) {
        console.error('Inventory error:', err);
        setError('Failed to load inventory');
        setInventory([]); // Ensure inventory is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      setUpdatingStock(productId);
      await productService.updateInventory(productId, newStock);
      
      // Update local state
      setInventory(inventory.map(item => 
        item._id === productId ? { ...item, stock: newStock } : item
      ));
    } catch (err: any) {
      alert('Failed to update stock');
    } finally {
      setUpdatingStock(null);
    }
  };

  const filteredInventory = (inventory || []).filter(item =>
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item?.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const totalProducts = (inventory || []).length;
  const outOfStock = (inventory || []).filter(item => item?.stock === 0).length;
  const lowStock = (inventory || []).filter(item => item?.stock > 0 && item?.stock < 10).length;
  const inStock = (inventory || []).filter(item => item?.stock >= 10).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold">{inStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Details</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Current Stock</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Last Updated</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-4 text-muted-foreground">
                      {searchTerm ? "No products found matching your search." : "No products found."}
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const stockInfo = getStockStatus(item.stock, item.is_active);
                    const StockIcon = getStockIcon(item.stock, item.is_active);
                    
                    return (
                      <tr key={item._id} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center space-x-3">
                            <ImageWithFallback
                              src={item.images.length > 0 ? `http://localhost:8080/${item.images[0]}` : undefined}
                              alt={item.name}
                              className="w-10 h-10 rounded object-cover"
                              fallbackClassName="w-10 h-10 bg-gray-200 rounded flex items-center justify-center"
                              fallbackContent={<Package className="h-5 w-5 text-gray-400" />}
                            />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">ID: {item._id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2">{item && item.category && item.category.name}</td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <StockIcon className="h-4 w-4" />
                            <span className="font-medium">{item.stock}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge className={stockInfo.color}>
                            {stockInfo.status.replace('-', ' ')}
                          </Badge>
                        </td>
                        <td className="p-2">₹{(item.price || 0).toLocaleString()}</td>
                        <td className="p-2">{formatDate(item.updated_at)}</td>
                        <td className="p-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={updatingStock === item._id}
                            onClick={() => {
                              const newStock = prompt(`Update stock for ${item.name}:`, item.stock.toString());
                              if (newStock !== null && !isNaN(Number(newStock))) {
                                handleStockUpdate(item._id, Number(newStock));
                              }
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

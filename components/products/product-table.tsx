"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useState } from "react";

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: "$199.99",
    stock: 45,
    status: "active",
    image: "/api/placeholder/50/50",
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: "$299.99",
    stock: 23,
    status: "active",
    image: "/api/placeholder/50/50",
  },
  {
    id: 3,
    name: "Running Shoes",
    category: "Sports",
    price: "$129.99",
    stock: 0,
    status: "out_of_stock",
    image: "/api/placeholder/50/50",
  },
  {
    id: 4,
    name: "Coffee Maker",
    category: "Home",
    price: "$89.99",
    stock: 12,
    status: "low_stock",
    image: "/api/placeholder/50/50",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "out_of_stock":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "low_stock":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

interface ProductTableProps {
  onAddProduct: () => void;
}

export function ProductTable({ onAddProduct }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="p-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-300 rounded"></div>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">{product.category}</td>
                  <td className="p-2 font-medium">{product.price}</td>
                  <td className="p-2">{product.stock}</td>
                  <td className="p-2">
                    <Badge className={getStatusColor(product.status)}>
                      {product.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, AlertTriangle, Package, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

const inventoryData = [
  {
    id: 1,
    name: "Wireless Headphones",
    sku: "WH-001",
    category: "Electronics",
    currentStock: 45,
    minStock: 10,
    maxStock: 100,
    reorderPoint: 15,
    unitCost: "$150.00",
    totalValue: "$6,750.00",
    supplier: "TechCorp",
    lastRestocked: "2024-01-10",
    status: "in_stock",
  },
  {
    id: 2,
    name: "Smart Watch",
    sku: "SW-002",
    category: "Electronics",
    currentStock: 8,
    minStock: 10,
    maxStock: 50,
    reorderPoint: 12,
    unitCost: "$200.00",
    totalValue: "$1,600.00",
    supplier: "WatchTech",
    lastRestocked: "2024-01-05",
    status: "low_stock",
  },
  {
    id: 3,
    name: "Running Shoes",
    sku: "RS-003",
    category: "Sports",
    currentStock: 0,
    minStock: 5,
    maxStock: 75,
    reorderPoint: 8,
    unitCost: "$80.00",
    totalValue: "$0.00",
    supplier: "SportGear",
    lastRestocked: "2023-12-20",
    status: "out_of_stock",
  },
  {
    id: 4,
    name: "Coffee Maker",
    sku: "CM-004",
    category: "Home",
    currentStock: 25,
    minStock: 5,
    maxStock: 40,
    reorderPoint: 8,
    unitCost: "$60.00",
    totalValue: "$1,500.00",
    supplier: "HomeTech",
    lastRestocked: "2024-01-12",
    status: "in_stock",
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    sku: "BS-005",
    category: "Electronics",
    currentStock: 3,
    minStock: 10,
    maxStock: 60,
    reorderPoint: 15,
    unitCost: "$45.00",
    totalValue: "$135.00",
    supplier: "AudioTech",
    lastRestocked: "2024-01-08",
    status: "critical",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "in_stock":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "low_stock":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "out_of_stock":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "critical":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getStockIcon = (currentStock: number, minStock: number) => {
  if (currentStock === 0) return <AlertTriangle className="h-4 w-4 text-red-500" />;
  if (currentStock <= minStock) return <TrendingDown className="h-4 w-4 text-yellow-500" />;
  return <TrendingUp className="h-4 w-4 text-green-500" />;
};

export function InventoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalValue = inventoryData.reduce((sum, item) => {
    return sum + parseFloat(item.totalValue.replace('$', '').replace(',', ''));
  }, 0);

  const lowStockItems = inventoryData.filter(item => 
    item.currentStock <= item.minStock && item.currentStock > 0
  ).length;

  const outOfStockItems = inventoryData.filter(item => item.currentStock === 0).length;

  return (
    <div className="space-y-6">
      {/* Inventory Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {inventoryData.length} products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Immediate attention required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryData.length}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Inventory Management</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  className="pl-10 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
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
                  <th className="text-left p-2">Current Stock</th>
                  <th className="text-left p-2">Stock Levels</th>
                  <th className="text-left p-2">Unit Cost</th>
                  <th className="text-left p-2">Total Value</th>
                  <th className="text-left p-2">Supplier</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        {getStockIcon(item.currentStock, item.minStock)}
                        <span className="font-medium">{item.currentStock}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <p>Min: {item.minStock}</p>
                        <p>Max: {item.maxStock}</p>
                        <p className="text-muted-foreground">Reorder: {item.reorderPoint}</p>
                      </div>
                    </td>
                    <td className="p-2 font-medium">{item.unitCost}</td>
                    <td className="p-2 font-medium">{item.totalValue}</td>
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{item.supplier}</p>
                        <p className="text-xs text-muted-foreground">
                          Last: {item.lastRestocked}
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
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
    </div>
  );
}
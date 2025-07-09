"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

const categories = [
  {
    id: 1,
    name: "Electronics",
    description: "Electronic devices and gadgets",
    products: 245,
    status: "active",
    parent: null,
  },
  {
    id: 2,
    name: "Smartphones",
    description: "Mobile phones and accessories",
    products: 89,
    status: "active",
    parent: "Electronics",
  },
  {
    id: 3,
    name: "Clothing",
    description: "Fashion and apparel",
    products: 156,
    status: "active",
    parent: null,
  },
  {
    id: 4,
    name: "Men's Clothing",
    description: "Clothing for men",
    products: 67,
    status: "active",
    parent: "Clothing",
  },
  {
    id: 5,
    name: "Books",
    description: "Books and literature",
    products: 23,
    status: "inactive",
    parent: null,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "inactive":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

interface CategoryTableProps {
  onAddCategory: () => void;
}

export function CategoryTable({ onAddCategory }: CategoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Categories</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-10 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={onAddCategory} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Parent</th>
                <th className="text-left p-2">Products</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className="border-b">
                  <td className="p-2 font-medium">{category.name}</td>
                  <td className="p-2 text-muted-foreground">{category.description}</td>
                  <td className="p-2">{category.parent || "-"}</td>
                  <td className="p-2">{category.products}</td>
                  <td className="p-2">
                    <Badge className={getStatusColor(category.status)}>
                      {category.status}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex space-x-2">
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
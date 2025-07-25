"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { categoryService } from "@/lib/services";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import { toast } from "@/lib/toast";

interface Category {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  product_count: number;
  status?: string;
  parent?: {
    _id: string;
    id?: string;
    name: string;
  } | null;
  image?: string;
  created_at: string;
  updated_at: string;
}

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
  onEditCategory?: (category: Category) => void;
}

export function CategoryTable({ onAddCategory, onEditCategory }: CategoryTableProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await categoryService.getCategories();
      console.log('Categories response:', data); // Debug log
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Categories error:', err);
      setError(err.message || "Failed to fetch categories");
      setCategories([]); // Ensure categories is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
      try {
        await categoryService.deleteCategory(category._id);
        toast.success('Category deleted successfully');
        // Refresh the categories list
        fetchCategories();
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to delete category";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const filteredCategories = (categories || []).filter(category =>
    category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category?.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort categories to show main categories first, then subcategories
  const sortedCategories = filteredCategories.sort((a, b) => {
    // Main categories first
    if (!a.parent && b.parent) return -1;
    if (a.parent && !b.parent) return 1;

    // If both are main categories or both are subcategories, sort by name
    if ((!a.parent && !b.parent) || (a.parent && b.parent)) {
      return a.name.localeCompare(b.name);
    }

    return 0;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading categories...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Categories</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              All categories and subcategories are stored in the same 'categories' collection.
              Main categories have parent=null, subcategories have parent=parentId.
            </p>
          </div>
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
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Image</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Parent</th>
                <th className="text-left p-2">Products</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-muted-foreground">
                    {searchTerm ? "No categories found matching your search." : "No categories found."}
                  </td>
                </tr>
              ) : (
                sortedCategories.map((category) => (
                  <tr key={category._id} className="border-b">
                    <td className="p-2">
                      <ImageWithFallback
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded-lg border"
                        fallbackClassName="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center"
                        fallbackContent={<span className="text-gray-400 text-xs">No Image</span>}
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center">
                        {category.parent && (
                          <div className="flex items-center text-gray-400 mr-2">
                            <span className="text-xs">└─</span>
                          </div>
                        )}
                        <span className={`font-medium ${category.parent ? 'text-blue-600' : 'text-gray-900'}`}>
                          {category.name}
                        </span>
                        {!category.parent && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Main
                          </span>
                        )}
                        {category.parent && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Sub
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-muted-foreground">{category.description || "-"}</td>
                    <td className="p-2">{category.parent?.name || "-"}</td>
                    <td className="p-2">{category.product_count}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(category.status || "active")}>
                        {category.status || "active"}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditCategory && onEditCategory(category)}
                          title="Edit Category"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
                          title="Delete Category"
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
      </CardContent>
    </Card>
  );
}
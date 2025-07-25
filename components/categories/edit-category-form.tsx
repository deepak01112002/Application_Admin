'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { categoryService, Category } from '@/lib/services';
import { toast } from '@/lib/toast';

interface EditCategoryFormProps {
  category: Category;
  onClose: () => void;
  onCategoryUpdated?: () => void;
}

export function EditCategoryForm({ category, onClose, onCategoryUpdated }: EditCategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description || '',
    parent: category.parent?._id || '',
  });

  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parentCategories, setParentCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchParentCategories();
  }, []);

  const fetchParentCategories = async () => {
    try {
      const categories = await categoryService.getCategories();
      // Filter to show only main categories (no parent) as potential parents
      // Also exclude the current category to prevent circular reference
      const mainCategories = categories.filter((cat: Category) =>
        !cat.parent && cat._id !== category._id
      );
      setParentCategories(mainCategories);
    } catch (err) {
      console.error('Failed to fetch parent categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);

      if (formData.parent) {
        formDataToSend.append('parent', formData.parent);
      }

      if (image) {
        formDataToSend.append('image', image);
      }

      await categoryService.updateCategory(category._id, formDataToSend);
      toast.success('Category updated successfully');

      if (onCategoryUpdated) {
        onCategoryUpdated();
      }
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update category';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Category</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                placeholder="Enter category name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                placeholder="Enter category description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category</Label>
              <Select value={formData.parent || "none"} onValueChange={(value) => handleInputChange("parent", value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category (leave empty for main category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Main Category)</SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Change parent category to move this category, or set to none to make it a main category.
              </p>
            </div>
          </div>

          {/* Category Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Category Image</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  Choose Image
                </Button>
              </div>

              {/* Display current image */}
              {category.image && !image && (
                <div className="relative inline-block">
                  <img
                    src={`http://localhost:8080/${category.image}`}
                    alt="Current category image"
                    className="w-32 h-32 object-cover rounded border"
                  />
                  <p className="text-sm text-gray-500 mt-1">Current image</p>
                </div>
              )}

              {/* Display selected new image */}
              {image && (
                <div className="relative inline-block">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="New category preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">New image</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating Category..." : "Update Category"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

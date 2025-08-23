'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { productService, categoryService, Product, Category } from '@/lib/services';
import { toast } from '@/lib/toast';

interface EditProductFormProps {
  product: Product;
  onClose: () => void;
  onProductUpdated?: () => void;
}

export function EditProductForm({ product, onClose, onProductUpdated }: EditProductFormProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    category: product.category.id || (product.category as any)._id || '',
    price: product.price.toString(),
    originalPrice: product.original_price.toString(),
    stock: product.stock.toString(),
    isActive: product.is_active,
    isFeatured: product.is_featured || false,
    // GST & Tax fields
    gstRate: (product.gstRate || 18).toString(),
    hsnCode: product.hsnCode || '9999',
    taxCategory: product.taxCategory || 'taxable',
    // Specifications
    material: product.specifications?.material || '',
    height: product.specifications?.height || '',
    width: product.specifications?.width || '',
    weight: product.specifications?.weight || '',
    finish: product.specifications?.finish || '',
    origin: product.specifications?.origin || '',
    color: product.specifications?.color || '',
    style: product.specifications?.style || '',
    occasion: product.specifications?.occasion || '',
    careInstructions: product.specifications?.careInstructions || '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>(product.images || []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
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
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('originalPrice', formData.originalPrice);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('isFeatured', formData.isFeatured.toString());

      // GST & Tax fields
      formDataToSend.append('gstRate', formData.gstRate);
      formDataToSend.append('hsnCode', formData.hsnCode);
      formDataToSend.append('taxCategory', formData.taxCategory);

      // Specifications
      formDataToSend.append('material', formData.material);
      formDataToSend.append('height', formData.height);
      formDataToSend.append('width', formData.width);
      formDataToSend.append('weight', formData.weight);
      formDataToSend.append('finish', formData.finish);
      formDataToSend.append('origin', formData.origin);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('style', formData.style);
      formDataToSend.append('occasion', formData.occasion);
      formDataToSend.append('careInstructions', formData.careInstructions);

      // Add new images if any
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      // Add images to delete
      if (imagesToDelete.length > 0) {
        formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      await productService.updateProduct(product._id, formDataToSend);
      toast.success('Product updated successfully');

      if (onProductUpdated) {
        onProductUpdated();
      }
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update product';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeCurrentImage = (index: number) => {
    const imageToDelete = currentImages[index];
    setImagesToDelete(prev => [...prev, imageToDelete]);
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Product</CardTitle>
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
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                placeholder="Enter product description"
              />
            </div>
          </div>

          {/* Pricing and Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing & Inventory</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (₹)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                  required
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* GST & Tax Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">GST & Tax Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstRate">GST Rate (%)</Label>
                <Input
                  id="gstRate"
                  type="number"
                  step="0.01"
                  value={formData.gstRate}
                  onChange={(e) => handleInputChange("gstRate", e.target.value)}
                  placeholder="18.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hsnCode">HSN Code</Label>
                <Input
                  id="hsnCode"
                  value={formData.hsnCode}
                  onChange={(e) => handleInputChange("hsnCode", e.target.value)}
                  placeholder="e.g., 9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxCategory">Tax Category</Label>
                <select
                  id="taxCategory"
                  value={formData.taxCategory}
                  onChange={(e) => handleInputChange("taxCategory", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="taxable">Taxable</option>
                  <option value="exempt">Exempt</option>
                  <option value="non-gst">Non-GST</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Status</h3>
            
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange("isActive", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange("isFeatured", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Specifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={formData.material}
                  onChange={(e) => handleInputChange("material", e.target.value)}
                  placeholder="e.g., Premium Brass/Marble"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="e.g., 12 inches"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  value={formData.width}
                  onChange={(e) => handleInputChange("width", e.target.value)}
                  placeholder="e.g., 8 inches"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="e.g., 2.5 kg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finish">Finish</Label>
                <Input
                  id="finish"
                  value={formData.finish}
                  onChange={(e) => handleInputChange("finish", e.target.value)}
                  placeholder="e.g., Antique Gold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => handleInputChange("origin", e.target.value)}
                  placeholder="e.g., Handcrafted in India"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  placeholder="e.g., Golden, Brown"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Input
                  id="style"
                  value={formData.style}
                  onChange={(e) => handleInputChange("style", e.target.value)}
                  placeholder="e.g., Traditional, Modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Input
                  id="occasion"
                  value={formData.occasion}
                  onChange={(e) => handleInputChange("occasion", e.target.value)}
                  placeholder="e.g., Festival, Daily Worship"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="careInstructions">Care Instructions</Label>
              <Textarea
                id="careInstructions"
                value={formData.careInstructions}
                onChange={(e) => handleInputChange("careInstructions", e.target.value)}
                placeholder="Instructions for maintaining the product..."
                rows={3}
              />
            </div>
          </div>

          {/* Current Images */}
          {currentImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.png';
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeCurrentImage(index)}
                      title="Delete image"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {imagesToDelete.length > 0 && (
                <div className="text-sm text-red-600">
                  {imagesToDelete.length} image(s) will be deleted when you save changes.
                </div>
              )}
            </div>
          )}

          {/* Add New Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add New Images</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload or drag and drop images
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                <input
                  type="file"
                  multiple
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
                  Choose Images
                </Button>
              </div>

              {/* Display selected new images */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New image ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
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
              {loading ? "Updating Product..." : "Update Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

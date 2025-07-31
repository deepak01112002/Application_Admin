"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Filter, 
  X, 
  Search, 
  Calendar,
  Star,
  Package,
  Tag,
  IndianRupee
} from "lucide-react";

interface FilterOptions {
  search: string;
  category: string;
  priceRange: [number, number];
  status: string;
  featured: string;
  stock: string;
  rating: string;
  dateRange: string;
  tags: string[];
  sortBy: string;
  sortOrder: string;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: Array<{ _id: string; name: string; }>;
  availableTags: string[];
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  categories,
  availableTags 
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      search: '',
      category: '',
      priceRange: [0, 10000],
      status: '',
      featured: '',
      stock: '',
      rating: '',
      dateRange: '',
      tags: [],
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    setIsOpen(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.status) count++;
    if (filters.featured) count++;
    if (filters.stock) count++;
    if (filters.rating) count++;
    if (filters.dateRange) count++;
    if (filters.tags.length > 0) count++;
    return count;
  };

  const handleTagToggle = (tag: string) => {
    const newTags = localFilters.tags.includes(tag)
      ? localFilters.tags.filter(t => t !== tag)
      : [...localFilters.tags, tag];
    setLocalFilters({ ...localFilters, tags: newTags });
  };

  const removeFilter = (filterKey: keyof FilterOptions) => {
    const newFilters = { ...filters };
    switch (filterKey) {
      case 'search':
        newFilters.search = '';
        break;
      case 'category':
        newFilters.category = '';
        break;
      case 'priceRange':
        newFilters.priceRange = [0, 10000];
        break;
      case 'status':
        newFilters.status = '';
        break;
      case 'featured':
        newFilters.featured = '';
        break;
      case 'stock':
        newFilters.stock = '';
        break;
      case 'rating':
        newFilters.rating = '';
        break;
      case 'dateRange':
        newFilters.dateRange = '';
        break;
      case 'tags':
        newFilters.tags = [];
        break;
    }
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* Category Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Category</Label>
                <Select 
                  value={localFilters.category} 
                  onValueChange={(value) => setLocalFilters({...localFilters, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Price Range: ₹{localFilters.priceRange[0]} - ₹{localFilters.priceRange[1]}
                </Label>
                <Slider
                  value={localFilters.priceRange}
                  onValueChange={(value) => setLocalFilters({...localFilters, priceRange: value as [number, number]})}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹0</span>
                  <span>₹10,000+</span>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Status</Label>
                <Select 
                  value={localFilters.status} 
                  onValueChange={(value) => setLocalFilters({...localFilters, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Featured Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Featured</Label>
                <Select 
                  value={localFilters.featured} 
                  onValueChange={(value) => setLocalFilters({...localFilters, featured: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All products</SelectItem>
                    <SelectItem value="true">Featured only</SelectItem>
                    <SelectItem value="false">Non-featured only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Stock Status</Label>
                <Select 
                  value={localFilters.stock} 
                  onValueChange={(value) => setLocalFilters({...localFilters, stock: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All stock levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All stock levels</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Minimum Rating</Label>
                <Select 
                  value={localFilters.rating} 
                  onValueChange={(value) => setLocalFilters({...localFilters, rating: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any rating</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Date Added</Label>
                <Select 
                  value={localFilters.dateRange} 
                  onValueChange={(value) => setLocalFilters({...localFilters, dateRange: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="quarter">This quarter</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={localFilters.tags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <Label htmlFor={tag} className="text-sm cursor-pointer">
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                  <Select 
                    value={localFilters.sortBy} 
                    onValueChange={(value) => setLocalFilters({...localFilters, sortBy: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date Added</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Order</Label>
                  <Select 
                    value={localFilters.sortOrder} 
                    onValueChange={(value) => setLocalFilters({...localFilters, sortOrder: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={handleResetFilters} className="flex-1">
                Reset All
              </Button>
              <Button onClick={handleApplyFilters} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => removeFilter('search')}
              />
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {categories.find(c => c._id === filters.category)?.name}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => removeFilter('category')}
              />
            </Badge>
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Price: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => removeFilter('priceRange')}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => removeFilter('status')}
              />
            </Badge>
          )}
          {filters.featured && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Featured: {filters.featured === 'true' ? 'Yes' : 'No'}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => removeFilter('featured')}
              />
            </Badge>
          )}
          {filters.tags.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Tags: {filters.tags.join(', ')}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => removeFilter('tags')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

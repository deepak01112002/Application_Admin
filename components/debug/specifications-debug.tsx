'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { productService, categoryService } from '@/lib/services';

export function SpecificationsDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testProductsAPI = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 Testing Products API...');
      
      // Test products list
      const productsResponse = await productService.getProducts({ limit: 5 });
      console.log('Products API Response:', productsResponse);
      
      // Test categories
      const categoriesResponse = await categoryService.getCategories();
      console.log('Categories API Response:', categoriesResponse);
      
      // Find a product with specifications
      const products = productsResponse.products || [];
      const productWithSpecs = products.find((p: any) => 
        p.specifications && Object.keys(p.specifications).some(key => 
          p.specifications[key] && key !== 'additionalInfo'
        )
      );
      
      let singleProductResponse = null;
      if (productWithSpecs) {
        console.log('🔍 Testing Single Product API...');
        singleProductResponse = await productService.getProduct(productWithSpecs._id);
        console.log('Single Product API Response:', singleProductResponse);
      }
      
      setDebugInfo({
        productsCount: products.length,
        products: products.slice(0, 3).map((p: any) => ({
          id: p._id,
          name: p.name,
          price: p.price,
          specifications: p.specifications || null,
          hasSpecs: p.specifications && Object.keys(p.specifications).some(key => 
            p.specifications[key] && key !== 'additionalInfo'
          )
        })),
        categoriesCount: categoriesResponse.length,
        categories: categoriesResponse.slice(0, 3).map((c: any) => ({
          id: c._id,
          name: c.name
        })),
        singleProduct: singleProductResponse ? {
          id: singleProductResponse._id,
          name: singleProductResponse.name,
          specifications: singleProductResponse.specifications || null
        } : null,
        timestamp: new Date().toISOString()
      });
      
    } catch (err: any) {
      console.error('Debug test failed:', err);
      setError(err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  const testFormData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🧪 Testing FormData Creation...');
      
      // Get categories first
      const categoriesResponse = await categoryService.getCategories();
      const testCategory = categoriesResponse[0];
      
      // Create FormData like the form would
      const formData = new FormData();
      formData.append('name', 'Debug Test Product');
      formData.append('description', 'Debug test description');
      formData.append('price', '999.99');
      formData.append('originalPrice', '1299.99');
      formData.append('category', testCategory._id);
      formData.append('stock', '10');
      formData.append('isActive', 'true');
      formData.append('isFeatured', 'false');
      
      // Specifications
      formData.append('material', 'Debug Test Material');
      formData.append('height', 'Debug Test Height');
      formData.append('width', 'Debug Test Width');
      formData.append('weight', 'Debug Test Weight');
      formData.append('finish', 'Debug Test Finish');
      formData.append('origin', 'Debug Test Origin');
      formData.append('color', 'Debug Test Color');
      formData.append('style', 'Debug Test Style');
      formData.append('occasion', 'Debug Test Occasion');
      formData.append('careInstructions', 'Debug Test Care Instructions');
      
      console.log('📤 Creating product with FormData...');
      const createResponse = await productService.createProduct(formData);
      console.log('Create Product Response:', createResponse);
      
      // Clean up
      if (createResponse._id) {
        console.log('🧹 Cleaning up test product...');
        await productService.deleteProduct(createResponse._id);
      }
      
      setDebugInfo({
        formDataTest: 'SUCCESS',
        createdProduct: {
          id: createResponse._id,
          name: createResponse.name,
          specifications: createResponse.specifications || null
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (err: any) {
      console.error('FormData test failed:', err);
      setError(err.message || 'FormData test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Specifications Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button 
            onClick={testProductsAPI} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Testing...' : 'Test Products API'}
          </Button>
          
          <Button 
            onClick={testFormData} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Testing...' : 'Test FormData Creation'}
          </Button>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {debugInfo && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="font-medium mb-2">Debug Results:</h3>
            <pre className="text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium mb-2">Instructions:</h3>
          <ol className="text-sm space-y-1">
            <li>1. Click "Test Products API" to check if specifications are being received</li>
            <li>2. Click "Test FormData Creation" to test product creation with specifications</li>
            <li>3. Check browser console for detailed logs</li>
            <li>4. If specifications are missing, check form field bindings</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

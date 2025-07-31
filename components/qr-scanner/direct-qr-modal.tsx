'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, Folder, Star, Calendar, Eye, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface DirectQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QRData {
  success: boolean;
  message: string;
  type: 'product' | 'category';
  viewType: 'admin';
  data: any;
}

export default function DirectQRModal({ isOpen, onClose }: DirectQRModalProps) {
  const [qrInput, setQrInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<QRData | null>(null);

  const formatPrice = (price: number | string | undefined | null) => {
    if (typeof price === 'string' && price.startsWith('₹')) {
      return price;
    }
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (typeof numPrice === 'number' && !isNaN(numPrice)) {
      return `₹${numPrice.toFixed(2)}`;
    }
    return '₹0.00';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleScan = async () => {
    if (!qrInput.trim()) {
      toast.error('Please enter QR code data');
      return;
    }

    try {
      setIsScanning(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('adminToken');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr-codes/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          qrData: qrInput.trim(),
          viewType: 'admin'
        })
      });

      const data = await response.json();

      if (data.success) {
        setScannedData(data);
        toast.success('QR code scanned successfully!');
      } else {
        toast.error(data.message || 'Failed to scan QR code');
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      toast.error('Failed to scan QR code');
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    setQrInput('');
    setScannedData(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Admin QR Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Input Section */}
          <div className="space-y-2">
            <Label htmlFor="qrInput">QR Code Data</Label>
            <div className="flex gap-2">
              <Input
                id="qrInput"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder='Paste QR data: {"type":"product","id":"product_id"}'
                className="flex-1"
              />
              <Button 
                onClick={handleScan} 
                disabled={isScanning || !qrInput.trim()}
                className="min-w-[120px]"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  'Scan QR Code'
                )}
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {scannedData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {scannedData.type === 'product' ? (
                    <Package className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Folder className="w-5 h-5 text-green-600" />
                  )}
                  {scannedData.data.name}
                  <Badge variant="outline" className="ml-2">
                    {scannedData.type.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scannedData.type === 'product' ? (
                  // Product Display
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Basic Info</Label>
                        <div className="space-y-2 mt-2">
                          <p><strong>Name:</strong> {scannedData.data.name}</p>
                          <p><strong>SKU:</strong> {scannedData.data.sku || 'N/A'}</p>
                          <p><strong>Price:</strong> {formatPrice(scannedData.data.price)}</p>
                          {scannedData.data.discountPrice && (
                            <p><strong>Discount Price:</strong> {formatPrice(scannedData.data.discountPrice)}</p>
                          )}
                          <p><strong>Stock:</strong> {scannedData.data.stock || 0} units</p>
                        </div>
                      </div>

                      {/* Admin Analytics */}
                      {scannedData.data.adminInfo && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <Label className="text-sm font-medium text-blue-800">📊 Admin Analytics</Label>
                          <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                            <div>
                              <span className="text-gray-600">Revenue:</span>
                              <div className="font-semibold text-green-600">
                                {scannedData.data.adminInfo.totalRevenue || '₹0.00'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Profit:</span>
                              <div className="font-semibold text-blue-600">
                                {scannedData.data.adminInfo.profitMargin || '0%'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Stock Status:</span>
                              <div className={`font-semibold ${
                                scannedData.data.adminInfo.stockStatus === 'Good Stock' ? 'text-green-600' :
                                scannedData.data.adminInfo.stockStatus === 'Low Stock' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {scannedData.data.adminInfo.stockStatus || 'Unknown'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Sales:</span>
                              <div className="font-semibold text-purple-600">
                                {scannedData.data.salesCount || 0} sold
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Product Image */}
                      {scannedData.data.images && scannedData.data.images.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Product Image</Label>
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mt-2">
                            <img 
                              src={scannedData.data.images[0]} 
                              alt={scannedData.data.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.png';
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2">
                        {scannedData.data.isFeatured && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {scannedData.data.isBestseller && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Bestseller
                          </Badge>
                        )}
                        {scannedData.data.isNewArrival && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            New Arrival
                          </Badge>
                        )}
                        <Badge variant={scannedData.data.isActive ? 'default' : 'destructive'}>
                          {scannedData.data.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Category Display
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Category Info</Label>
                          <div className="space-y-2 mt-2">
                            <p><strong>Name:</strong> {scannedData.data.name}</p>
                            <p><strong>Description:</strong> {scannedData.data.description || 'No description'}</p>
                            <p><strong>Products:</strong> {scannedData.data.productsCount || 0}</p>
                            <p><strong>Featured:</strong> {scannedData.data.featuredProductsCount || 0}</p>
                          </div>
                        </div>

                        {/* Admin Analytics */}
                        {scannedData.data.adminInfo && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <Label className="text-sm font-medium text-green-800">📊 Category Analytics</Label>
                            <div className="space-y-2 mt-2 text-sm">
                              <div>
                                <span className="text-gray-600">Average Price:</span>
                                <div className="font-semibold text-green-600">
                                  {scannedData.data.adminInfo.averagePrice || 'N/A'}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Performance:</span>
                                <div className={`font-semibold ${
                                  scannedData.data.adminInfo.categoryPerformance === 'Good' ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                  {scannedData.data.adminInfo.categoryPerformance || 'Unknown'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Category Image */}
                        {scannedData.data.image && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Category Image</Label>
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mt-2">
                              <img 
                                src={scannedData.data.image} 
                                alt={scannedData.data.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <Badge variant={scannedData.data.isActive ? 'default' : 'destructive'}>
                          {scannedData.data.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    {/* Sample Products */}
                    {scannedData.data.sampleProducts && scannedData.data.sampleProducts.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Sample Products</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {scannedData.data.sampleProducts.slice(0, 4).map((product: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium">{product.name}</span>
                              <span className="text-sm text-green-600 font-semibold">
                                {formatPrice(product.discountPrice || product.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatDate(scannedData.data.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>ID: {scannedData.data.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

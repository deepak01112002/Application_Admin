"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QrCode, Scan, Package, Tag, Calendar, DollarSign, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScannedData {
  type: 'product' | 'category';
  data: any;
}

export function QRScanner({ isOpen, onClose }: QRScannerProps) {
  const [qrInput, setQrInput] = useState('');
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (!qrInput.trim()) {
      toast.error('Please enter QR code data');
      return;
    }

    try {
      setIsScanning(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr-codes/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qrData: qrInput.trim(),
          viewType: 'admin'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to scan QR code');
      }

      const result = await response.json();
      
      if (result.success) {
        setScannedData({
          type: result.type,
          data: result.data
        });
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Failed to scan QR code');
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

  const formatPrice = (price: number | string | undefined | null) => {
    if (typeof price === 'string' && price.startsWith('₹')) {
      return price;
    }
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (typeof numPrice === 'number' && !isNaN(numPrice)) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(numPrice);
    }
    return '₹0.00';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            QR Code Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Input Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-input">QR Code Data</Label>
              <div className="flex gap-2">
                <Input
                  id="qr-input"
                  placeholder="Paste QR code data here or scan with your device..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleScan}
                  disabled={isScanning || !qrInput.trim()}
                  className="flex items-center gap-2"
                >
                  {isScanning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <QrCode className="w-4 h-4" />
                  )}
                  Scan
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Tip: Use your phone's camera to scan the QR code, then copy and paste the data here.
            </p>
          </div>

          {/* Scanned Data Display */}
          {scannedData && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {scannedData.type === 'product' ? (
                    <Package className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Tag className="w-5 h-5 text-green-600" />
                  )}
                  <h3 className="text-lg font-semibold">
                    {scannedData.type === 'product' ? 'Product Details' : 'Category Details'}
                  </h3>
                  <Badge variant={scannedData.type === 'product' ? 'default' : 'secondary'}>
                    {scannedData.type.toUpperCase()}
                  </Badge>
                </div>

                {scannedData.type === 'product' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{scannedData.data.name}</span>
                        <Badge variant={scannedData.data.isActive ? 'default' : 'destructive'}>
                          {scannedData.data.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Description</Label>
                            <p className="text-sm">{scannedData.data.description || 'No description available'}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Price</Label>
                              <p className="text-lg font-semibold text-green-600">
                                {formatPrice(scannedData.data.price)}
                              </p>
                            </div>
                            {scannedData.data.discountPrice && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Discount Price</Label>
                                <p className="text-lg font-semibold text-red-600">
                                  {formatPrice(scannedData.data.discountPrice)}
                                </p>
                              </div>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-600">Category</Label>
                            <p className="text-sm">{scannedData.data.category?.name || 'No category'}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-600">Stock</Label>
                            <p className="text-sm">{scannedData.data.stock || 0} units</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {scannedData.data.isFeatured && (
                              <Badge variant="outline">Featured</Badge>
                            )}
                            {scannedData.data.isBestseller && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Bestseller</Badge>
                            )}
                            {scannedData.data.isNewArrival && (
                              <Badge variant="outline" className="bg-green-100 text-green-800">New Arrival</Badge>
                            )}
                            <Badge variant="outline">
                              ID: {scannedData.data.id}
                            </Badge>
                          </div>

                          {/* Admin-specific information */}
                          {scannedData.data.adminInfo && (
                            <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                              <Label className="text-sm font-medium text-blue-800">Admin Analytics</Label>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Total Revenue:</span>
                                  <span className="font-medium ml-1">
                                    {scannedData.data.adminInfo.totalRevenue ?
                                      formatPrice(scannedData.data.adminInfo.totalRevenue) :
                                      '₹0.00'
                                    }
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Profit Margin:</span>
                                  <span className="font-medium ml-1">{scannedData.data.adminInfo.profitMargin}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Stock Status:</span>
                                  <span className={`font-medium ml-1 ${
                                    scannedData.data.adminInfo.stockStatus === 'Good Stock' ? 'text-green-600' :
                                    scannedData.data.adminInfo.stockStatus === 'Low Stock' ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {scannedData.data.adminInfo.stockStatus}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Sales Count:</span>
                                  <span className="font-medium ml-1">{scannedData.data.salesCount || 0}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          {scannedData.data.images && scannedData.data.images.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Product Images</Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {scannedData.data.images.slice(0, 4).map((image: string, index: number) => (
                                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <img 
                                      src={image} 
                                      alt={`Product ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {scannedData.data.specifications && (
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Specifications</Label>
                              <div className="space-y-1 mt-2">
                                {Object.entries(scannedData.data.specifications).map(([key, value]) => (
                                  <div key={key} className="flex justify-between text-sm">
                                    <span className="capitalize text-gray-600">{key}:</span>
                                    <span>{value as string}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Created: {formatDate(scannedData.data.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{scannedData.data.name}</span>
                        <Badge variant={scannedData.data.isActive ? 'default' : 'destructive'}>
                          {scannedData.data.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Description</Label>
                            <p className="text-sm">{scannedData.data.description || 'No description available'}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-600">Products Count</Label>
                            <p className="text-lg font-semibold text-blue-600">
                              {scannedData.data.productsCount} products
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-600">Featured Products</Label>
                            <p className="text-lg font-semibold text-yellow-600">
                              {scannedData.data.featuredProductsCount} featured
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              ID: {scannedData.data.id}
                            </Badge>
                          </div>

                          {/* Admin-specific information */}
                          {scannedData.data.adminInfo && (
                            <div className="bg-green-50 p-3 rounded-lg space-y-2">
                              <Label className="text-sm font-medium text-green-800">Admin Analytics</Label>
                              <div className="grid grid-cols-1 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Average Price:</span>
                                  <span className="font-medium ml-1">{scannedData.data.adminInfo.averagePrice}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Performance:</span>
                                  <span className={`font-medium ml-1 ${
                                    scannedData.data.adminInfo.categoryPerformance === 'Good' ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    {scannedData.data.adminInfo.categoryPerformance}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Status:</span>
                                  <span className={`font-medium ml-1 ${
                                    scannedData.data.adminInfo.status === 'Active' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {scannedData.data.adminInfo.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Created: {formatDate(scannedData.data.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
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

                          {scannedData.data.sampleProducts && scannedData.data.sampleProducts.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Sample Products</Label>
                              <div className="space-y-2 mt-2">
                                {scannedData.data.sampleProducts.map((product: any) => (
                                  <div key={product._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm font-medium">{product.name}</span>
                                    <span className="text-sm text-green-600">
                                      {formatPrice(product.discountPrice || product.price)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

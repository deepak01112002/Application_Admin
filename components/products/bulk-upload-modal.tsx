"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileText, AlertCircle, CheckCircle, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { productService } from "@/lib/services";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
}

export function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please select a CSV or Excel file');
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template
    const headers = [
      'name',
      'description',
      'price',
      'category',
      'subcategory',
      'stock',
      'sku',
      'weight',
      'height',
      'material',
      'color',
      'imageUrl1',
      'imageUrl2',
      'imageUrl3'
    ];
    
    const sampleData = [
      'Sample Product',
      'This is a sample product description',
      '999.99',
      'Category Name',
      'Subcategory Name',
      '100',
      'SKU001',
      '2.5',
      '15',
      'Brass',
      'Golden',
      'https://your-bucket.contabo.com/products/image1.jpg',
      'https://your-bucket.contabo.com/products/image2.jpg',
      'https://your-bucket.contabo.com/products/image3.jpg'
    ];

    const instructionRow = [
      'INSTRUCTIONS:',
      'Upload images to S3 first via product edit form',
      'Price in INR',
      'Main category name',
      'Sub category name',
      'Stock quantity',
      'Unique SKU code',
      'Weight in KG',
      'Height in CM',
      'Material type',
      'Color name',
      'Use Contabo S3 HTTPS URLs only',
      'Use Contabo S3 HTTPS URLs only',
      'Use Contabo S3 HTTPS URLs only'
    ];

    const csvContent = [
      headers.join(','),
      instructionRow.join(','),
      sampleData.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_product_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully');
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await productService.bulkUpload(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setUploadResult({
          success: response.data.success || 0,
          failed: response.data.failed || 0,
          errors: response.data.errors || []
        });
        
        if (response.data.success > 0) {
          toast.success(`Successfully uploaded ${response.data.success} products`);
          onSuccess();
        }
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      toast.error(error.message || 'Failed to upload products');
      setUploadResult({
        success: 0,
        failed: 1,
        errors: [error.message || 'Upload failed']
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      setUploadProgress(0);
      setUploadResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Product Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Upload multiple products at once using a CSV or Excel file.
              Download the template below to see the required format.
            </AlertDescription>
          </Alert>

          {/* Image Handling Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              📸 How to Handle Product Images
            </h3>
            <div className="space-y-3 text-sm text-blue-800">

              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium mb-2">✅ Accepted Image Formats:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>• <strong>CSV Format:</strong> https://link1.jpg,https://link2.jpg</div>
                  <div>• <strong>File Types:</strong> JPG, PNG, WebP</div>
                  <div>• <strong>Size:</strong> Max 5MB per image</div>
                  <div>• <strong>Dimensions:</strong> Min 300x300px recommended</div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                <h4 className="font-medium mb-1 text-yellow-800">⚠️ Important Notes:</h4>
                <ul className="list-disc list-inside text-xs text-yellow-700 space-y-1">
                  <li>Images must be uploaded to Contabo S3 first (use existing product edit form)</li>
                  <li>Only use HTTPS URLs for security</li>
                  <li>Test image links in browser before adding to CSV</li>
                  <li>Multiple images: separate with commas (no spaces)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Download Template</h3>
              <p className="text-sm text-muted-foreground">
                Get the CSV template with sample data and required columns
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <Input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Success</p>
                    <p className="text-sm text-green-700">{uploadResult.success} products</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Failed</p>
                    <p className="text-sm text-red-700">{uploadResult.failed} products</p>
                  </div>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-900">Errors:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadResult.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              <X className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Products'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

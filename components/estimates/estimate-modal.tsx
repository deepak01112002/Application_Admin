"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Send, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/lib/services";

interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate?: any;
  onSuccess: () => void;
}

export default function EstimateModal({ isOpen, onClose, estimate, onSuccess }: EstimateModalProps) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [formData, setFormData] = useState({
    companyDetails: {
      name: "Ghanshyam Murti Bhandar",
      address: "Shree Vashunadhara Soc. Block No 153, Cancal Road, Jilla Garden, Rajkot, Gujarat, 360002",
      phone: "+91 9999999999",
      email: "info@ghanshyammurtibhandar.com",
      gstin: "24XXXXX1234X1ZX"
    },
    notes: "",
    termsAndConditions: "This estimate is valid for 30 days. Prices are subject to change without notice.",
    isGSTApplicable: true,
    taxType: "GST",
    isInterState: false,
    validityDays: 30
  });

  // Fetch orders for estimate generation
  const fetchOrders = async () => {
    try {
      const response = await adminService.get('/orders/admin/all?status=confirmed&limit=50');
      if (response.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    if (isOpen && !estimate) {
      fetchOrders();
    }
  }, [isOpen, estimate]);

  // Generate estimate from order
  const generateEstimate = async () => {
    if (!selectedOrderId) {
      toast.error('Please select an order');
      return;
    }

    try {
      setLoading(true);
      const response = await adminService.post(`/estimates/admin/generate/${selectedOrderId}`, formData);
      
      if (response.success) {
        toast.success('Estimate generated successfully');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error generating estimate:', error);
      toast.error('Failed to generate estimate');
    } finally {
      setLoading(false);
    }
  };

  // Download estimate PDF
  const downloadEstimate = async (format: 'standard' | 'thermal' | '4x6' = 'standard') => {
    if (!estimate) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/estimates/${estimate._id}/download?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Estimate-${format}-${estimate.estimateNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Estimate downloaded in ${format} format`);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading estimate:', error);
      toast.error('Failed to download estimate');
    }
  };

  // Update estimate status
  const updateStatus = async (status: string) => {
    if (!estimate) return;

    try {
      setLoading(true);
      const response = await adminService.patch(`/estimates/admin/${estimate._id}/status`, { status });
      
      if (response.success) {
        toast.success('Estimate status updated successfully');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update estimate status');
    } finally {
      setLoading(false);
    }
  };

  // Convert to invoice
  const convertToInvoice = async () => {
    if (!estimate) return;

    try {
      setLoading(true);
      const response = await adminService.post(`/estimates/admin/${estimate._id}/convert-to-invoice`);
      
      if (response.success) {
        toast.success('Estimate converted to invoice successfully');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error converting estimate:', error);
      toast.error('Failed to convert estimate to invoice');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired && status !== 'converted') {
      return <Badge variant="destructive">Expired</Badge>;
    }

    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'sent':
        return <Badge variant="outline">Sent</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'converted':
        return <Badge variant="default" className="bg-blue-500">Converted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {estimate ? `Estimate ${estimate.estimateNumber}` : 'Generate New Estimate'}
          </DialogTitle>
        </DialogHeader>

        {estimate ? (
          // View existing estimate
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Estimate Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Estimate Number:</span>
                      <span className="font-medium">{estimate.estimateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <span>{new Date(estimate.estimateDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Valid Until:</span>
                      <span className={estimate.isExpired ? 'text-red-500' : ''}>
                        {new Date(estimate.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      {getStatusBadge(estimate.status, estimate.isExpired)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Grand Total:</span>
                      <span className="font-bold text-lg">₹{estimate.grandTotal?.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{estimate.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{estimate.customerEmail}</span>
                    </div>
                    {estimate.customerDetails?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{estimate.customerDetails.phone}</span>
                      </div>
                    )}
                    {estimate.customerDetails?.billingAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="text-sm">
                          <div>{estimate.customerDetails.billingAddress.street}</div>
                          <div>
                            {estimate.customerDetails.billingAddress.city}, {estimate.customerDetails.billingAddress.state}
                          </div>
                          <div>{estimate.customerDetails.billingAddress.postalCode}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {estimate.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{estimate.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Estimate Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                        {estimate.taxDetails?.isGSTApplicable && <TableHead>GST</TableHead>}
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estimate.items?.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-muted-foreground">{item.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.rate}</TableCell>
                          <TableCell>₹{item.taxableAmount}</TableCell>
                          {estimate.taxDetails?.isGSTApplicable && (
                            <TableCell>₹{(item.cgst + item.sgst + item.igst).toFixed(2)}</TableCell>
                          )}
                          <TableCell>₹{item.totalAmount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 space-y-2 text-right">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{estimate.pricing?.subtotal?.toLocaleString()}</span>
                    </div>
                    {estimate.taxDetails?.isGSTApplicable && (
                      <div className="flex justify-between">
                        <span>Total GST:</span>
                        <span>₹{estimate.pricing?.totalGST?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Grand Total:</span>
                      <span>₹{estimate.pricing?.grandTotal?.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Download Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => downloadEstimate('standard')} 
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Standard PDF (A4)
                    </Button>
                    <Button 
                      onClick={() => downloadEstimate('thermal')} 
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Thermal Print (58mm)
                    </Button>
                    <Button 
                      onClick={() => downloadEstimate('4x6')} 
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      4x6 Format (Shipping Label)
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" />
                      Status Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {estimate.status === 'draft' && (
                      <Button 
                        onClick={() => updateStatus('sent')} 
                        className="w-full justify-start"
                        disabled={loading}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Mark as Sent
                      </Button>
                    )}
                    
                    {estimate.status === 'sent' && (
                      <>
                        <Button 
                          onClick={() => updateStatus('accepted')} 
                          className="w-full justify-start"
                          disabled={loading}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Accepted
                        </Button>
                        <Button 
                          onClick={() => updateStatus('rejected')} 
                          className="w-full justify-start"
                          variant="outline"
                          disabled={loading}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Mark as Rejected
                        </Button>
                      </>
                    )}

                    {estimate.status === 'accepted' && !estimate.isExpired && (
                      <Button 
                        onClick={convertToInvoice} 
                        className="w-full justify-start"
                        disabled={loading}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Convert to Invoice
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Generate new estimate form
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="order">Select Order</Label>
                <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an order to generate estimate" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((order: any) => (
                      <SelectItem key={order._id} value={order._id}>
                        {order.orderNumber} - {order.user?.firstName} {order.user?.lastName} (₹{order.pricing?.total})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validityDays">Validity (Days)</Label>
                  <Input
                    id="validityDays"
                    type="number"
                    value={formData.validityDays}
                    onChange={(e) => setFormData({...formData, validityDays: parseInt(e.target.value)})}
                    min="1"
                    max="365"
                  />
                </div>
                <div>
                  <Label htmlFor="taxType">Tax Type</Label>
                  <Select 
                    value={formData.taxType} 
                    onValueChange={(value) => setFormData({...formData, taxType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GST">GST</SelectItem>
                      <SelectItem value="IGST">IGST</SelectItem>
                      <SelectItem value="NON_GST">Non-GST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="gst-applicable"
                  checked={formData.isGSTApplicable}
                  onCheckedChange={(checked) => setFormData({...formData, isGSTApplicable: checked})}
                />
                <Label htmlFor="gst-applicable">GST Applicable</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="inter-state"
                  checked={formData.isInterState}
                  onCheckedChange={(checked) => setFormData({...formData, isInterState: checked})}
                />
                <Label htmlFor="inter-state">Inter-state Transaction</Label>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Add any additional notes..."
                />
              </div>

              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({...formData, termsAndConditions: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={generateEstimate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Estimate'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

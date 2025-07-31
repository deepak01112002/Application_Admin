"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Printer, Download, X, QrCode } from "lucide-react";
import { useReactToPrint } from "react-to-print";

interface OrderBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export function OrderBillModal({ isOpen, onClose, order }: OrderBillModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const billRef = useRef<HTMLDivElement>(null);

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && order) {
      generateQRCode();
    }
  }, [isOpen, order]);

  const generateQRCode = async () => {
    try {
      const qrData = JSON.stringify({
        orderNumber: order.orderNumber || order._id,
        customerName: order.customer?.name || order.customerName || 'Customer',
        trackingUrl: `https://ghanshyammurtibhandar.com/track/${order.orderNumber || order._id}`,
        awbCode: order.shipping?.awbCode || null,
        companyName: 'GHANSHYAM MURTI BHANDAR'
      });

      // Using QR Server API for QR code generation
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => billRef.current,
    documentTitle: `Invoice-${order?.orderNumber || order?._id}`,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    pageStyle: `
      @page {
        size: 4in 6in;
        margin: 0.2in;
      }
      @media print {
        body { 
          font-size: 10px;
          line-height: 1.2;
        }
        .no-print { display: none !important; }
        .print-only { display: block !important; }
      }
    `,
  });

  const handleThermalPrint = () => {
    // For thermal printer (4x6 inch)
    const printWindow = window.open('', '_blank');
    if (printWindow && billRef.current) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice-${order?.orderNumber}</title>
          <style>
            @page { 
              size: 4in 6in; 
              margin: 0.1in; 
            }
            body { 
              font-family: 'Courier New', monospace;
              font-size: 9px;
              line-height: 1.1;
              margin: 0;
              padding: 2px;
            }
            .header { text-align: center; font-weight: bold; margin-bottom: 8px; }
            .company-name { font-size: 12px; font-weight: bold; }
            .section { margin: 4px 0; }
            .row { display: flex; justify-content: space-between; margin: 1px 0; }
            .bold { font-weight: bold; }
            .center { text-align: center; }
            .right { text-align: right; }
            .border-top { border-top: 1px dashed #000; padding-top: 2px; }
            .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 2px; }
            table { width: 100%; border-collapse: collapse; font-size: 8px; }
            th, td { padding: 1px 2px; text-align: left; }
            .barcode { font-family: 'Libre Barcode 128', monospace; font-size: 24px; text-align: center; }
          </style>
        </head>
        <body>
          ${billRef.current.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  const downloadBill = () => {
    if (billRef.current) {
      const element = billRef.current;
      const opt = {
        margin: 0.2,
        filename: `invoice-${order?.orderNumber || order?._id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: [4, 6], orientation: 'portrait' }
      };
      
      // Note: You'll need to install html2pdf.js
      // import html2pdf from 'html2pdf.js';
      // html2pdf().set(opt).from(element).save();
      
      // For now, we'll use browser print
      window.print();
    }
  };

  if (!order) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calculate totals with proper fallback logic
  const calculateItemTotal = (item: any) => {
    return item.totalPrice ||
           (item.unitPrice * item.quantity) ||
           (item.price * item.quantity) ||
           item.total ||
           0;
  };

  const subtotal = order.pricing?.subtotal ||
                  order.items?.reduce((sum: number, item: any) => sum + calculateItemTotal(item), 0) ||
                  0;

  const calculatedTax = subtotal * 0.18; // 18% GST
  const tax = order.pricing?.tax || order.tax || calculatedTax;
  const shipping = order.pricing?.shipping || order.shippingCharges || order.shipping || 0;
  const discount = order.pricing?.discount || order.discountAmount || order.discount || 0;

  // Enhanced total calculation with multiple fallbacks
  const total = order.pricing?.total ||
                order.finalAmount ||
                order.total ||
                order.totalAmount ||
                order.grandTotal ||
                (subtotal + tax + shipping - discount);

  // Get customer info with comprehensive fallbacks
  const customer = order.user || order.customer || order.customerDetails || {};
  const customerName = customer.name ||
                      customer.fullName ||
                      `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
                      order.customerName ||
                      order.billingAddress?.name ||
                      order.shippingAddress?.name ||
                      'Guest Customer';
  const customerEmail = customer.email || order.customerEmail || order.billingAddress?.email || 'N/A';
  const customerPhone = customer.phone || order.customerPhone || order.billingAddress?.phone || order.shippingAddress?.phone || 'N/A';

  // Get shipping address with comprehensive fallbacks
  const shippingAddr = order.shippingAddress || order.address || order.shipping?.address || order.deliveryAddress || {};
  const shippingAddress = shippingAddr.completeAddress ||
    `${shippingAddr.addressLine1 || ''} ${shippingAddr.addressLine2 || ''} ${shippingAddr.city || ''} ${shippingAddr.state || ''} ${shippingAddr.postalCode || shippingAddr.pincode || ''}`.trim() ||
    `${shippingAddr.street || ''} ${shippingAddr.area || ''} ${shippingAddr.city || ''} ${shippingAddr.state || ''}`.trim() ||
    shippingAddr.address ||
    'Address not available';

  const shippingCity = shippingAddr.city || 'N/A';
  const shippingState = shippingAddr.state || 'N/A';
  const shippingPincode = shippingAddr.pincode || shippingAddr.postalCode || shippingAddr.zipCode || 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="no-print">
          <DialogTitle>Order Invoice - {order.orderNumber || order._id}</DialogTitle>
          <div className="flex gap-2">
            <Button onClick={handlePrint} disabled={isPrinting}>
              <Printer className="h-4 w-4 mr-2" />
              Print (A4)
            </Button>
            <Button onClick={handleThermalPrint} variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Thermal Print (4x6)
            </Button>
            <Button onClick={downloadBill} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Invoice Content */}
        <div ref={billRef} className="bg-white p-6 text-black">
          {/* Header */}
          <div className="header text-center mb-6">
            <div className="company-name text-xl font-bold">GHANSHYAM MURTI BHANDAR</div>
            <div className="text-sm mt-1">Tax Invoice/Bill of Supply/Cash Memo</div>
            <div className="text-xs">(Triplicate for Supplier)</div>
          </div>

          {/* Company and Customer Details */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
            {/* Sold By */}
            <div>
              <div className="font-bold mb-2">Sold By:</div>
              <div className="font-bold">GHANSHYAM MURTI BHANDAR</div>
              <div>CANAL ROAD vasudhra soc, block no 193, near</div>
              <div>jilla garden cancal road</div>
              <div>Rajkot, GUJARAT, 360002</div>
              <div>IN</div>
              <div className="mt-2">
                <div>PAN No: BYAPD0171N</div>
                <div>GST Registration No: 24BYAPD0171N1ZP</div>
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <div className="font-bold mb-2">Billing Address:</div>
              <div className="font-bold">{customerName}</div>
              <div>{shippingAddress}</div>
              <div>{shippingCity}, {shippingState} - {shippingPincode}</div>
              <div>IN</div>
              <div>State/UT Code: 36</div>
              <div>Phone: {customerPhone}</div>

              <div className="mt-4">
                <div className="font-bold mb-2">Shipping Address:</div>
                <div className="font-bold">{customerName}</div>
                <div>{shippingAddress}</div>
                <div>{shippingCity}, {shippingState} - {shippingPincode}</div>
                <div>IN</div>
                <div>State/UT Code: 36</div>
                <div>Phone: {customerPhone}</div>
                <div>Place of supply: {shippingState.toUpperCase()}</div>
                <div>Place of delivery: {shippingState.toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
            <div>
              <div>Order Number: {order.orderNumber || order._id}</div>
              <div>Order Date: {formatDate(order.createdAt)}</div>
            </div>
            <div className="text-right">
              <div>Invoice Number: IN-{(order.orderNumber || order._id || '').slice(-6)}</div>
              <div>Invoice Date: {formatDate(order.createdAt)}</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-400 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left">Sl.</th>
                  <th className="border border-gray-400 p-2 text-left">Description</th>
                  <th className="border border-gray-400 p-2 text-center">Unit Price</th>
                  <th className="border border-gray-400 p-2 text-center">Qty</th>
                  <th className="border border-gray-400 p-2 text-center">Net Amount</th>
                  <th className="border border-gray-400 p-2 text-center">Tax Rate</th>
                  <th className="border border-gray-400 p-2 text-center">Tax Type</th>
                  <th className="border border-gray-400 p-2 text-center">Tax Amount</th>
                  <th className="border border-gray-400 p-2 text-center">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item: any, index: number) => {
                  const itemTotal = item.totalPrice || (item.price * item.quantity) || 0;
                  const itemTax = itemTotal * 0.18; // 18% GST
                  const product = item.product || {};
                  const specs = product.specifications || {};
                  
                  return (
                    <tr key={index}>
                      <td className="border border-gray-400 p-2 text-center">{index + 1}</td>
                      <td className="border border-gray-400 p-2">
                        <div className="font-medium">{product.name || item.name || 'Product'}</div>
                        {specs.material && <div className="text-xs text-gray-600">Material: {specs.material}</div>}
                        {specs.height && <div className="text-xs text-gray-600">Height: {specs.height}</div>}
                        {specs.weight && <div className="text-xs text-gray-600">Weight: {specs.weight}</div>}
                        {specs.finish && <div className="text-xs text-gray-600">Finish: {specs.finish}</div>}
                      </td>
                      <td className="border border-gray-400 p-2 text-center">₹{(item.price || item.unitPrice || 0).toFixed(2)}</td>
                      <td className="border border-gray-400 p-2 text-center">{item.quantity || 1}</td>
                      <td className="border border-gray-400 p-2 text-center">₹{itemTotal.toFixed(2)}</td>
                      <td className="border border-gray-400 p-2 text-center">18%</td>
                      <td className="border border-gray-400 p-2 text-center">GST</td>
                      <td className="border border-gray-400 p-2 text-center">₹{itemTax.toFixed(2)}</td>
                      <td className="border border-gray-400 p-2 text-center">₹{(itemTotal + itemTax).toFixed(2)}</td>
                    </tr>
                  );
                })}
                <tr className="font-bold bg-gray-50">
                  <td colSpan={8} className="border border-gray-400 p-2 text-right">TOTAL:</td>
                  <td className="border border-gray-400 p-2 text-center">₹{total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in Words */}
          <div className="mb-6 text-xs">
            <div className="font-bold">Amount in Words:</div>
            <div>Rupees {convertNumberToWords(total)} only</div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
            <div>
              <div className="font-bold mb-2">For GHANSHYAM MURTI BHANDAR:</div>
              <div className="mt-8">
                <div className="border-t border-gray-400 pt-2 text-center">Authorized Signatory</div>
              </div>
            </div>
            <div>
              <div>Whether tax is payable under reverse charge - No</div>
            </div>
          </div>

          {/* Payment Transaction Details */}
          <div className="border border-gray-400 p-2 text-xs">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="font-bold">Payment Transaction ID:</div>
                <div>{order.paymentInfo?.razorpayPaymentId || order.paymentInfo?.transactionId || 'N/A'}</div>
              </div>
              <div>
                <div className="font-bold">Date & Time:</div>
                <div>{formatDate(order.createdAt)}</div>
              </div>
              <div>
                <div className="font-bold">Invoice Value:</div>
                <div>₹{total.toFixed(2)}</div>
              </div>
              <div>
                <div className="font-bold">Mode of Payment:</div>
                <div>{order.paymentInfo?.method?.toUpperCase() || 'COD'}</div>
              </div>
            </div>
          </div>

          {/* QR Code Section for Order Tracking (Flipkart Style) */}
          <div className="mt-4 border border-gray-400 p-4 text-center">
            <div className="flex items-center justify-center gap-4">
              <div>
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Order Tracking QR Code"
                    className="w-24 h-24 border border-gray-300"
                  />
                ) : (
                  <div className="w-24 h-24 border border-gray-300 flex items-center justify-center bg-gray-100">
                    <QrCode className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="text-left text-xs">
                <div className="font-bold mb-1">Scan QR Code for Order Tracking</div>
                <div>Order: {order.orderNumber || order._id}</div>
                {order.shipping?.awbCode && (
                  <div>AWB: {order.shipping.awbCode}</div>
                )}
                <div className="text-gray-600 mt-1">
                  Track your order status and delivery updates
                </div>
              </div>
            </div>
          </div>

          {/* Barcode Section for Thermal Print */}
          <div className="print-only hidden mt-4 text-center">
            <div className="barcode">*{order.orderNumber || order._id}*</div>
            <div className="text-xs">AWB {order.shipping?.awbCode || 'PENDING'}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to convert number to words (simplified)
function convertNumberToWords(num: number): string {
  if (num === 0) return "Zero";
  
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  function convertHundreds(n: number): string {
    let result = "";
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + " ";
      return result;
    }
    if (n > 0) {
      result += ones[n] + " ";
    }
    return result;
  }
  
  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const hundreds = num % 1000;
  
  let result = "";
  if (crores > 0) result += convertHundreds(crores) + "Crore ";
  if (lakhs > 0) result += convertHundreds(lakhs) + "Lakh ";
  if (thousands > 0) result += convertHundreds(thousands) + "Thousand ";
  if (hundreds > 0) result += convertHundreds(hundreds);
  
  return result.trim();
}

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
  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const billRef = useRef<HTMLDivElement>(null);
  const thermalBillRef = useRef<HTMLDivElement>(null);



  // Generate QR code and load signature when modal opens
  useEffect(() => {
    if (isOpen && order) {
      generateQRCode();
      loadSignature();
    }
  }, [isOpen, order]);

  const loadSignature = () => {
    // Load the signature image
    setSignatureUrl('/Signature_GM.jpeg');
  };

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
        size: A4; 
        margin: 0.5in; 
      }
      
        body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        background: white;
        color: #333;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #333;
        padding-bottom: 20px;
      }
      
      .company-name {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #333;
      }
      
      .text-sm {
        font-size: 14px;
        margin-top: 4px;
      }
      
      .text-xs {
        font-size: 12px;
        margin-top: 2px;
      }
      
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-bottom: 30px;
      }
      
      .font-bold {
        font-weight: bold;
      }
      
      .mb-2 {
        margin-bottom: 8px;
      }
      
      .mb-4 {
        margin-bottom: 16px;
      }
      
      .mb-6 {
        margin-bottom: 24px;
      }
      
      .mt-2 {
        margin-top: 8px;
      }
      
      .mt-4 {
        margin-top: 16px;
      }
      
      .text-center {
        text-align: center;
      }
      
      .text-right {
        text-align: right;
      }
      
      .text-left {
        text-align: left;
      }
      
      .bg-gray-50 {
        background-color: #f9fafb;
      }
      
      .border {
        border: 1px solid #d1d5db;
      }
      
      .border-t {
        border-top: 1px solid #d1d5db;
      }
      
      .border-b {
        border-bottom: 1px solid #d1d5db;
      }
      
      .p-2 {
        padding: 8px;
      }
      
      .p-4 {
        padding: 16px;
      }
      
      .py-2 {
        padding-top: 8px;
        padding-bottom: 8px;
      }
      
      .py-4 {
        padding-top: 16px;
        padding-bottom: 16px;
      }
      
      .px-4 {
        padding-left: 16px;
        padding-right: 16px;
      }
      
      .w-full {
        width: 100%;
      }
      
      .h-32 {
        height: 128px;
      }
      
      .flex {
        display: flex;
      }
      
      .justify-between {
        justify-content: space-between;
      }
      
      .justify-center {
        justify-content: center;
      }
      
      .items-center {
        align-items: center;
      }
      
      .gap-4 {
        gap: 16px;
      }
      
      .gap-6 {
        gap: 24px;
      }
      
      .rounded {
        border-radius: 4px;
      }
      
      .text-gray-600 {
        color: #4b5563;
      }
      
      .text-gray-500 {
        color: #6b7280;
      }
      
      .text-gray-400 {
        color: #9ca3af;
      }
      
      .text-green-600 {
        color: #059669;
      }
      
      .text-red-600 {
        color: #dc2626;
      }
      
      .text-blue-600 {
        color: #2563eb;
      }
      
      .text-yellow-600 {
        color: #ca8a04;
      }
      
      .bg-green-100 {
        background-color: #dcfce7;
      }
      
      .bg-red-100 {
        background-color: #fee2e2;
      }
      
      .bg-blue-100 {
        background-color: #dbeafe;
      }
      
      .bg-yellow-100 {
        background-color: #fef3c7;
      }
      
      .px-2 {
        padding-left: 8px;
        padding-right: 8px;
      }
      
      .py-1 {
        padding-top: 4px;
        padding-bottom: 4px;
      }
      
      .text-xs {
        font-size: 12px;
      }
      
      .font-semibold {
        font-weight: 600;
      }
      
      .uppercase {
        text-transform: uppercase;
      }
      
      .tracking-wide {
        letter-spacing: 0.05em;
      }
      
      .hidden {
        display: none !important;
      }
      
      .print-only {
        display: block !important;
      }
      
      .print-content {
        background: white !important;
        color: #333 !important;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        font-size: 12px !important;
        line-height: 1.4 !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      
      .print-content .header {
        text-align: center !important;
        margin-bottom: 30px !important;
        border-bottom: 2px solid #333 !important;
        padding-bottom: 20px !important;
      }
      
      .print-content .company-name {
        font-size: 24px !important;
        font-weight: bold !important;
        margin-bottom: 10px !important;
        color: #333 !important;
      }
      
      .print-content .grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 30px !important;
        margin-bottom: 30px !important;
      }
      
      .print-content .font-bold {
        font-weight: bold !important;
      }
      
      .print-content .mb-2 {
        margin-bottom: 8px !important;
      }
      
      .print-content .mb-4 {
        margin-bottom: 16px !important;
      }
      
      .print-content .mb-6 {
        margin-bottom: 24px !important;
      }
      
      .print-content .mt-2 {
        margin-top: 8px !important;
      }
      
      .print-content .mt-4 {
        margin-top: 16px !important;
      }
      
      .print-content .text-center {
        text-align: center !important;
      }
      
      .print-content .text-right {
        text-align: right !important;
      }
      
      .print-content .text-left {
        text-align: left !important;
      }
      
      .print-content .bg-gray-50 {
        background-color: #f9fafb !important;
      }
      
      .print-content .border {
        border: 1px solid #d1d5db !important;
      }
      
      .print-content .border-t {
        border-top: 1px solid #d1d5db !important;
      }
      
      .print-content .border-b {
        border-bottom: 1px solid #d1d5db !important;
      }
      
      .print-content .p-2 {
        padding: 8px !important;
      }
      
      .print-content .p-4 {
        padding: 16px !important;
      }
      
      .print-content .py-2 {
        padding-top: 8px !important;
        padding-bottom: 8px !important;
      }
      
      .print-content .py-4 {
        padding-top: 16px !important;
        padding-bottom: 16px !important;
      }
      
      .print-content .px-4 {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
      
      .print-content .w-full {
        width: 100% !important;
      }
      
      .print-content .h-32 {
        height: 128px !important;
      }
      
      .print-content .flex {
        display: flex !important;
      }
      
      .print-content .justify-between {
        justify-content: space-between !important;
      }
      
      .print-content .justify-center {
        justify-content: center !important;
      }
      
      .print-content .items-center {
        align-items: center !important;
      }
      
      .print-content .gap-4 {
        gap: 16px !important;
      }
      
      .print-content .gap-6 {
        gap: 24px !important;
      }
      
      .print-content .rounded {
        border-radius: 4px !important;
      }
      
      .print-content .text-gray-600 {
        color: #4b5563 !important;
      }
      
      .print-content .text-gray-500 {
        color: #6b7280 !important;
      }
      
      .print-content .text-gray-400 {
        color: #9ca3af !important;
      }
      
      .print-content .text-green-600 {
        color: #059669 !important;
      }
      
      .print-content .text-red-600 {
        color: #dc2626 !important;
      }
      
      .print-content .text-blue-600 {
        color: #2563eb !important;
      }
      
      .print-content .text-yellow-600 {
        color: #ca8a04 !important;
      }
      
      .print-content .bg-green-100 {
        background-color: #dcfce7 !important;
      }
      
      .print-content .bg-red-100 {
        background-color: #fee2e2 !important;
      }
      
      .print-content .bg-blue-100 {
        background-color: #dbeafe !important;
      }
      
      .print-content .bg-yellow-100 {
        background-color: #fef3c7 !important;
      }
      
      .print-content .px-2 {
        padding-left: 8px !important;
        padding-right: 8px !important;
      }
      
      .print-content .py-1 {
        padding-top: 4px !important;
        padding-bottom: 4px !important;
      }
      
      .print-content .text-xs {
        font-size: 12px !important;
      }
      
      .print-content .text-sm {
        font-size: 14px !important;
      }
      
      .print-content .font-semibold {
        font-weight: 600 !important;
      }
      
      .print-content .uppercase {
        text-transform: uppercase !important;
      }
      
      .print-content .tracking-wide {
        letter-spacing: 0.05em !important;
      }
      
      @media print {
        .no-print { 
          display: none !important; 
        }
        .print-only { 
          display: block !important; 
        }
        /* Ensure thermal label never appears in A4 prints */
        #thermal-label { 
          display: none !important; 
        }
        /* Preserve colors in print */
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        /* Ensure proper page breaks */
        .grid {
          page-break-inside: avoid;
        }
        .border {
          page-break-inside: avoid;
        }
      }
    `,
  } as any);

  const handleThermalPrint = () => {
    console.log('Thermal Print clicked');
    const thermalContent = thermalBillRef.current;
    
    if (thermalContent) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Thermal Print - ${order?.orderNumber || order?._id}</title>
          <style>
            @page {
              size: 4in 6in;
                margin: 0;
                padding: 0;
              }
              
              * {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                page-break-before: avoid !important;
                page-break-after: avoid !important;
              }
              
            body {
                width: 4in !important;
                height: 6in !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                font-size: 4px !important;
                line-height: 0.9 !important;
                max-height: 6in !important;
                min-height: 6in !important;
                box-sizing: border-box !important;
              }
              
              #thermal-label {
                width: 4in !important;
                height: 6in !important;
                max-height: 6in !important;
                min-height: 6in !important;
                overflow: hidden !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
              }
              
              .grid {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              
              .border {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              
              img {
                max-width: 100% !important;
                height: auto !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
          </style>
        </head>
        <body>
            ${thermalContent.outerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
        printWindow.print();
        };
    } else {
      alert('Failed to open print window. Please check popup blockers.');
      }
    } else {
      alert('Thermal content not found.');
    }
  };

  const handleEstimateBill = () => {
    console.log('Estimate Bill clicked');
    console.log('Order:', order);
    
    // Create a professional estimate bill with accurate data
    const estimateWindow = window.open('', '_blank');
    if (estimateWindow) {
      const estimateContent = billRef.current?.innerHTML || '';
      
      estimateWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Estimate - ${order?.orderNumber || order?._id}</title>
          <style>
            @page { size: A4; margin: 0.5in; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 20px;
              background: white;
              color: #333;
            }
            .estimate-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
            }
            .estimate-title {
              font-size: 36px;
              font-weight: bold;
              color: #28a745;
              text-transform: uppercase;
            }
            .logo-placeholder {
              border: 2px solid #333;
              padding: 20px;
              text-align: center;
              font-weight: bold;
              background: #f8f9fa;
              min-width: 120px;
            }
            .estimate-details {
              border: 1px solid #333;
              padding: 15px;
              min-width: 200px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              font-size: 11px;
            }
            .detail-label {
              font-weight: bold;
              min-width: 80px;
            }
            .detail-value {
              border-bottom: 1px solid #ccc;
              flex: 1;
              margin-left: 10px;
              min-height: 16px;
            }
            .company-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .company-info, .bill-to {
              flex: 1;
              margin: 0 15px;
            }
            .company-info h3, .bill-to h3 {
              margin: 0 0 15px 0;
              font-size: 16px;
              font-weight: bold;
              color: #333;
            }
            .company-info p, .bill-to p {
              margin: 5px 0;
              font-size: 12px;
              color: #666;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th {
              background: #f8f9fa;
              border: 1px solid #333;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              font-size: 12px;
            }
            .items-table td {
              border: 1px solid #333;
              padding: 12px 8px;
              font-size: 11px;
              min-height: 20px;
            }
            .quantity-col { width: 15%; }
            .description-col { width: 50%; }
            .unit-price-col { width: 15%; }
            .total-col { width: 20%; }
            .comments-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .comments {
              flex: 1;
              margin-right: 20px;
            }
            .comments h3 {
              margin: 0 0 15px 0;
              font-size: 14px;
              font-weight: bold;
              color: #333;
            }
            .comment-line {
              border-bottom: 1px solid #ccc;
              height: 20px;
              margin: 8px 0;
            }
            .financial-summary {
              width: 200px;
            }
            .financial-summary table {
              width: 100%;
              border-collapse: collapse;
            }
            .financial-summary td {
              border: 1px solid #333;
              padding: 8px;
              font-size: 11px;
            }
            .financial-summary .label {
              font-weight: bold;
              background: #f8f9fa;
              width: 60%;
            }
            .financial-summary .value {
              border-bottom: 1px solid #ccc;
              min-height: 16px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              font-size: 18px;
              font-style: italic;
              color: #28a745;
              font-weight: bold;
            }
            .no-print { display: block; }
            @media print {
              .no-print { display: none !important; }
            }
            .action-buttons {
              text-align: center;
              margin: 30px 0;
            }
            .btn {
              background: #007bff;
              color: white;
              border: none;
              padding: 12px 25px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
              margin: 0 10px;
              transition: all 0.3s ease;
              text-decoration: none;
              display: inline-block;
            }
            .btn:hover {
              background: #0056b3;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0,123,255,0.3);
            }
            .btn-success {
              background: #28a745;
            }
            .btn-success:hover {
              background: #1e7e34;
            }
            .btn-secondary {
              background: #6c757d;
            }
            .btn-secondary:hover {
              background: #545b62;
            }
          </style>
        </head>
        <body>
          <div class="estimate-header">
            <div class="estimate-title">ESTIMATE</div>
            <div class="logo-placeholder">GHANSHYAM MURTI BHANDAR</div>
            <div class="estimate-details">
              <div class="detail-row">
                <span class="detail-label">ESTIMATE NO</span>
                <span class="detail-value">${order?.orderNumber || order?._id || 'EST-001'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">DATE</span>
                <span class="detail-value">${new Date(order?.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">TERMS</span>
                <span class="detail-value">${order?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">CUSTOMER</span>
                <span class="detail-value">${order?.customer?.name || order?.customerName || 'Customer Name'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">PROJECT</span>
                <span class="detail-value">Order ${order?.orderNumber || order?._id || 'Project'}</span>
              </div>
            </div>
          </div>
          
          <div class="company-section">
            <div class="company-info">
              <h3>GHANSHYAM MURTI BHANDAR</h3>
              <p>CANAL ROAD vasudhra soc, block no 193, near</p>
              <p>jilla garden cancal road</p>
              <p>Rajkot, GUJARAT, 360002</p>
              <p>Phone: +91-XXXXXXXXXX</p>
              <p>Email: info@ghanshyammurti.com</p>
              <p>PAN: BYAPD0171N</p>
              <p>GST: 24BYAPD0171N1ZP</p>
            </div>
            <div class="bill-to">
              <h3>BILL TO</h3>
              <p>${order?.customer?.name || order?.customerName || 'Customer Name'}</p>
              <p>${order?.shippingAddress?.addressLine1 || order?.shippingAddress?.address || 'Customer Address'}</p>
              <p>${order?.shippingAddress?.city || 'City'}, ${order?.shippingAddress?.state || 'State'} ${order?.shippingAddress?.postalCode || order?.shippingAddress?.pincode || 'Zip'}</p>
              <p>${order?.customer?.phone || order?.customerPhone || 'Phone Number'}</p>
              <p>${order?.customer?.email || order?.customerEmail || 'Email'}</p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th class="quantity-col">QUANTITY</th>
                <th class="description-col">DESCRIPTION</th>
                <th class="unit-price-col">UNIT PRICE</th>
                <th class="total-col">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${order?.items?.map((item: any) => {
                // Use the same calculation logic as the main bill
                const itemTotal = item.totalPrice ||
                                 (item.unitPrice * item.quantity) ||
                                 (item.price * item.quantity) ||
                                 item.total ||
                                 item.subtotal ||
                                 0;
                
                return `
                  <tr>
                    <td>${item.quantity || 1}</td>
                    <td>${item.productSnapshot?.name || item.product?.name || item.name || item.productName || 'Product Name'}</td>
                    <td>₹${item.unitPrice || item.price || item.amount || '0'}</td>
                    <td>₹${itemTotal.toFixed(2)}</td>
                  </tr>
                `;
              }).join('') || `
                <tr>
                  <td>1</td>
                  <td>Product/Service Description</td>
                  <td>₹0</td>
                  <td>₹0</td>
                </tr>
              `}
              ${Array.from({length: 8}, () => `
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="comments-section">
            <div class="comments">
              <h3>COMMENTS</h3>
              <div class="comment-line"></div>
              <div class="comment-line"></div>
              <div class="comment-line"></div>
              <div class="comment-line"></div>
            </div>
            <div class="financial-summary">
              <table>
                <tr>
                  <td class="label">SUB TOTAL</td>
                  <td class="value">₹${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td class="label">TAX (GST)</td>
                  <td class="value">₹${tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td class="label">DISCOUNT</td>
                  <td class="value">₹${discount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td class="label">GRAND TOTAL</td>
                  <td class="value">₹${total.toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>
          
          <div class="footer">
            Thank you for your business
          </div>
          
          <div class="action-buttons no-print">
            <button class="btn btn-success" onclick="window.print()">🖨️ Print Estimate</button>
            <button class="btn btn-secondary" onclick="window.close()">❌ Close Window</button>
          </div>
        </body>
        </html>
      `);
      estimateWindow.document.close();
    } else {
      alert('Failed to open estimate window. Please check popup blockers.');
    }
  };

  const downloadBill = () => {
    console.log('Download A4 Bill clicked');
    const billContent = billRef.current;
    
    if (billContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>A4 Invoice - ${order?.orderNumber || order?._id}</title>
            <style>
              @page { 
                size: A4; 
                margin: 0.5in; 
              }
              
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                margin: 0;
                padding: 20px;
                background: white;
                color: #333;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              
              .company-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
              }
              
              .text-sm {
                font-size: 14px;
                margin-top: 4px;
              }
              
              .text-xs {
                font-size: 12px;
                margin-top: 2px;
              }
              
              .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
              }
              
              .section-title {
                font-weight: bold;
                margin-bottom: 15px;
                color: #333;
                font-size: 14px;
              }
              
              .company-info p, .customer-info p {
                margin: 5px 0;
                font-size: 12px;
                color: #666;
              }
              
              .order-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
              }
              
              .order-info p {
                margin: 5px 0;
                font-size: 12px;
              }
              
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
              }
              
              .items-table th {
                background: #f8f9fa;
                border: 1px solid #333;
                padding: 12px 8px;
                text-align: left;
                font-weight: bold;
                font-size: 12px;
              }
              
              .items-table td {
                border: 1px solid #333;
                padding: 12px 8px;
                font-size: 11px;
              }
              
              .total-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
              }
              
              .total-table {
                width: 300px;
                margin-left: auto;
              }
              
              .total-table td {
                border: 1px solid #333;
                padding: 8px 12px;
                font-size: 12px;
              }
              
              .total-table .label {
                font-weight: bold;
                background: #f8f9fa;
                width: 60%;
              }
              
              .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 14px;
                color: #666;
              }
              
              .qr-section {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
              }
              
              .qr-info {
                flex: 1;
              }
              
              .qr-code {
                width: 100px;
                height: 100px;
                border: 1px solid #ddd;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f8f9fa;
              }
              
              .no-print {
                display: block;
              }
              
              @media print {
                .no-print {
                  display: none !important;
                }
              }
              
              .action-buttons {
                text-align: center;
                margin: 30px 0;
              }
              
              .btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                margin: 0 10px;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
              }
              
              .btn:hover {
                background: #0056b3;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,123,255,0.3);
              }
              
              .btn-success {
                background: #28a745;
              }
              
              .btn-success:hover {
                background: #1e7e34;
              }
              
              /* Ensure thermal label never appears in A4 downloads */
              #thermal-label { 
                display: none !important; 
              }
              
              /* Preserve all A4 bill styling */
              .print-content {
                background: white !important;
                color: #333 !important;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                font-size: 12px !important;
                line-height: 1.4 !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              
              .print-content .header {
                text-align: center !important;
                margin-bottom: 30px !important;
                border-bottom: 2px solid #333 !important;
                padding-bottom: 20px !important;
              }
              
              .print-content .company-name {
                font-size: 24px !important;
                font-weight: bold !important;
                margin-bottom: 10px !important;
                color: #333 !important;
              }
              
              .print-content .grid {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 30px !important;
                margin-bottom: 30px !important;
              }
              
              .print-content .font-bold {
                font-weight: bold !important;
              }
              
              .print-content .mb-2 {
                margin-bottom: 8px !important;
              }
              
              .print-content .mb-4 {
                margin-bottom: 16px !important;
              }
              
              .print-content .mb-6 {
                margin-bottom: 24px !important;
              }
              
              .print-content .mt-2 {
                margin-top: 8px !important;
              }
              
              .print-content .mt-4 {
                margin-top: 16px !important;
              }
              
              .print-content .text-center {
                text-align: center !important;
              }
              
              .print-content .text-right {
                text-align: right !important;
              }
              
              .print-content .text-left {
                text-align: left !important;
              }
              
              .print-content .bg-gray-50 {
                background-color: #f9fafb !important;
              }
              
              .print-content .border {
                border: 1px solid #d1d5db !important;
              }
              
              .print-content .border-t {
                border-top: 1px solid #d1d5db !important;
              }
              
              .print-content .border-b {
                border-bottom: 1px solid #d1d5db !important;
              }
              
              .print-content .p-2 {
                padding: 8px !important;
              }
              
              .print-content .p-4 {
                padding: 16px !important;
              }
              
              .print-content .py-2 {
                padding-top: 8px !important;
                padding-bottom: 8px !important;
              }
              
              .print-content .py-4 {
                padding-top: 16px !important;
                padding-bottom: 16px !important;
              }
              
              .print-content .px-4 {
                padding-left: 16px !important;
                padding-right: 16px !important;
              }
              
              .print-content .w-full {
                width: 100% !important;
              }
              
              .print-content .h-32 {
                height: 128px !important;
              }
              
              .print-content .flex {
                display: flex !important;
              }
              
              .print-content .justify-between {
                justify-content: space-between !important;
              }
              
              .print-content .justify-center {
                justify-content: center !important;
              }
              
              .print-content .items-center {
                align-items: center !important;
              }
              
              .print-content .gap-4 {
                gap: 16px !important;
              }
              
              .print-content .gap-6 {
                gap: 24px !important;
              }
              
              .print-content .rounded {
                border-radius: 4px !important;
              }
              
              .print-content .text-gray-600 {
                color: #4b5563 !important;
              }
              
              .print-content .text-gray-500 {
                color: #6b7280 !important;
              }
              
              .print-content .text-gray-400 {
                color: #9ca3af !important;
              }
              
              .print-content .text-green-600 {
                color: #059669 !important;
              }
              
              .print-content .text-red-600 {
                color: #dc2626 !important;
              }
              
              .print-content .text-blue-600 {
                color: #2563eb !important;
              }
              
              .print-content .text-yellow-600 {
                color: #ca8a04 !important;
              }
              
              .print-content .bg-green-100 {
                background-color: #dcfce7 !important;
              }
              
              .print-content .bg-red-100 {
                background-color: #fee2e2 !important;
              }
              
              .print-content .bg-blue-100 {
                background-color: #dbeafe !important;
              }
              
              .print-content .bg-yellow-100 {
                background-color: #fef3c7 !important;
              }
              
              .print-content .px-2 {
                padding-left: 8px !important;
                padding-right: 8px !important;
              }
              
              .print-content .py-1 {
                padding-top: 4px !important;
                padding-bottom: 4px !important;
              }
              
              .print-content .text-xs {
                font-size: 12px !important;
              }
              
              .print-content .text-sm {
                font-size: 14px !important;
              }
              
              .print-content .font-semibold {
                font-weight: 600 !important;
              }
              
              .print-content .uppercase {
                text-transform: uppercase !important;
              }
              
              .print-content .tracking-wide {
                letter-spacing: 0.05em !important;
              }
            </style>
          </head>
          <body>
            ${billContent.outerHTML}
            
            <div class="action-buttons no-print">
              <button class="btn btn-success" onclick="window.print()">🖨️ Print A4 Bill</button>
              <button class="btn" onclick="window.close()">❌ Close Window</button>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        
        // Wait for content to load then show print dialog
        printWindow.onload = () => {
          // Don't auto-print, let user choose
          console.log('A4 bill window loaded successfully');
        };
      } else {
        alert('Failed to open print window. Please check popup blockers.');
      }
    } else {
      alert('Bill content not found.');
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
    const itemTotal = item.totalPrice ||
                     (item.unitPrice * item.quantity) ||
                     (item.price * item.quantity) ||
                     item.total ||
                     item.subtotal ||
                     0;

    return itemTotal;
  };

  const subtotal = order.pricing?.subtotal ||
                  order.items?.reduce((sum: number, item: any) => sum + calculateItemTotal(item), 0) ||
                  0;

  // Calculate tax based on stored tax amounts or product-specific GST rates
  let calculatedTax = 0;
  if (order.items && order.items.length > 0) {
    calculatedTax = order.items.reduce((sum: number, item: any) => {
      // Use stored tax amount if available, otherwise calculate from rate
      if (item.tax && typeof item.tax === 'number') {
        return sum + item.tax;
      } else {
        const itemTotal = calculateItemTotal(item);
        const gstRate = item.taxRate || item.productSnapshot?.gstRate || item.product?.gstRate || 18;
        return sum + (itemTotal * (gstRate / 100));
      }
    }, 0);
  } else {
    calculatedTax = subtotal * 0.18; // Fallback to 18% if no items
  }

  const tax = order.pricing?.tax || order.tax || calculatedTax;
  const shipping = order.pricing?.shipping || 
                  order.shippingCharges || 
                  (typeof order.shipping === 'object' ? order.shipping?.shippingCost || 0 : order.shipping) || 
                  0;
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
          <div className="flex gap-2 mt-4">
            <Button onClick={handlePrint} disabled={isPrinting}>
              <Printer className="h-4 w-4 mr-2" />
              {isPrinting ? 'Printing...' : 'Print A4 Bill'}
            </Button>
            
            <Button onClick={handleThermalPrint} variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print Thermal (4x6)
            </Button>
            
            <Button onClick={handleEstimateBill} variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Estimate Bill
            </Button>
            
            <Button onClick={downloadBill} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download A4
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* A4 Tax Invoice Content */}
        <div ref={billRef} className="bg-white p-6 text-black print-content">
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
                  // Prioritize stored tax rate from order item, then productSnapshot, then product, then default
                  const gstRate = item.taxRate || item.productSnapshot?.gstRate || item.product?.gstRate || 18;
                  // Use stored tax amount if available, otherwise calculate
                  const itemTax = item.tax || (itemTotal * (gstRate / 100));
                  const product = item.product || {};
                  const specs = product.specifications || {};
                  
                  return (
                    <tr key={index}>
                      <td className="border border-gray-400 p-2 text-center">{index + 1}</td>
                      <td className="border border-gray-400 p-2">
                        <div className="font-medium">{item.productSnapshot?.name || product.name || item.name || 'Product'}</div>
                        {specs.material && <div className="text-xs text-gray-600">Material: {specs.material}</div>}
                        {specs.height && <div className="text-xs text-gray-600">Height: {specs.height}</div>}
                        {specs.weight && <div className="text-xs text-gray-600">Weight: {specs.weight}</div>}
                        {specs.finish && <div className="text-xs text-gray-600">Finish: {specs.finish}</div>}
                        {item.productSnapshot?.hsnCode && <div className="text-xs text-gray-600">HSN: {item.productSnapshot.hsnCode}</div>}
                      </td>
                      <td className="border border-gray-400 p-2 text-center">₹{(item.price || item.unitPrice || 0).toFixed(2)}</td>
                      <td className="border border-gray-400 p-2 text-center">{item.quantity || 1}</td>
                      <td className="border border-gray-400 p-2 text-center">₹{itemTotal.toFixed(2)}</td>
                      <td className="border border-gray-400 p-2 text-center">{gstRate}%</td>
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

          {/* Summary Section */}
          <div className="mb-6">
            <div className="flex justify-end">
              <table className="w-64 border-collapse border border-gray-400 text-xs">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">SUB TOTAL:</td>
                    <td className="border border-gray-400 p-2 text-right">₹{subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">TAX (GST):</td>
                    <td className="border border-gray-400 p-2 text-right">₹{tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">SHIPPING:</td>
                    <td className="border border-gray-400 p-2 text-right">₹{shipping.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">DISCOUNT:</td>
                    <td className="border border-gray-400 p-2 text-right">₹{discount.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-gray-400 p-2">GRAND TOTAL:</td>
                    <td className="border border-gray-400 p-2 text-right">₹{total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                {signatureUrl && (
                  <div className="mb-2">
                    <img
                      src={signatureUrl}
                      alt="Authorized Signature"
                      className="h-12 w-auto mx-auto"
                    />
                  </div>
                )}
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

        {/* Thermal Shipping Label (4x6 in) - Exact format from image */}
        <div id="thermal-label"
          ref={thermalBillRef}
          className="bg-white text-black hidden"
          style={{ 
            width: '4in', 
            height: '6in', 
            fontSize: '4px', 
            lineHeight: '0.9', 
            overflow: 'hidden',
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
            margin: '0',
            padding: '0',
            position: 'relative',
            border: '1px solid #000',
            maxHeight: '6in',
            minHeight: '6in'
          }}
        >
          {/* Top Section: Customer Address (Left) + Delhivery (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '0.002in', height: '1.2in', margin: '0' }}>
            {/* Left: Customer Address */}
            <div style={{ border: '1px solid #000', padding: '0.002in', height: '100%', boxSizing: 'border-box' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '6px' }}>Customer Address</div>
              <div style={{ fontWeight: 'bold', textTransform: 'lowercase', fontSize: '7px' }}>{customerName}</div>
              <div style={{ whiteSpace: 'pre-line', fontSize: '5px', marginTop: '2px' }}>{shippingAddress}</div>
              <div style={{ fontSize: '5px', marginTop: '2px' }}>{shippingCity}, {shippingState}, {shippingPincode}</div>
          </div>

            {/* Right: Delhivery block */}
            <div style={{ border: '1px solid #000', padding: '0.002in', height: '100%', position: 'relative', boxSizing: 'border-box' }}>
              {/* COD banner */}
              <div style={{ background: '#000', color: 'white', textAlign: 'center', height: '0.08in', lineHeight: '0.08in', fontWeight: 700, marginBottom: '0.002in', fontSize: '4px' }}>
                COD: Check the payable amount on
            </div>
              <div style={{ fontWeight: 'bold', fontSize: '7px' }}>Delhivery</div>
              <div style={{ display: 'inline-block', color: 'white', fontSize: '3px', padding: '1px 2px', marginTop: '2px', background: '#000', borderRadius: '1px' }}>Pickup</div>
              <div style={{ fontSize: '3px', marginTop: '2px' }}>Destination Code</div>
              <div style={{ fontSize: '3px', marginTop: '2px' }}>Return Code</div>
              <div style={{ fontSize: '4px', fontWeight: 600 }}>360002,2155544</div>
            </div>
          </div>

          {/* Middle Section: Return Address (Left) + Codes/QR/Barcode (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '0.002in', marginTop: '0.002in', height: '1.2in' }}>
            {/* Left: Return Address */}
            <div style={{ border: '1px solid #000', padding: '0.002in', height: '100%', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '4px', marginBottom: '2px' }}>If undelivered, return to:</div>
              <div style={{ fontWeight: 'bold', fontSize: '5px' }}>GHANSHYAM MURATI BHANDAR</div>
              <div style={{ whiteSpace: 'pre-line', fontSize: '3px' }}>SHREE VASHUNADHARA SOC. BLOCK NO
193, CANCAL ROAD
JILLA GARDEN
rajkot, Gujarat, 360002</div>
          </div>

            {/* Right: Codes, QR, Barcode */}
            <div style={{ border: '1px solid #000', padding: '0.002in', height: '100%', boxSizing: 'border-box' }}>
              {/* QR Code */}
              <div style={{ marginTop: '2px', display: 'flex', justifyContent: 'center' }}>
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR" style={{ width: '0.3in', height: '0.3in' }} />
                ) : (
                  <div style={{ width: '0.3in', height: '0.3in', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode className="h-2 w-2 text-gray-400" />
              </div>
            )}
            </div>
              
              {/* Order Number */}
              <div style={{ textAlign: 'center', fontWeight: 600, fontSize: '5px', marginTop: '2px' }}>
                {(order.orderNumber || order._id) as string}
          </div>

              {/* Barcode */}
              <div style={{ marginTop: '2px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <img
                  alt="barcode"
                  style={{ width: '100%', height: '0.15in', objectFit: 'contain' }}
                  src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(
                    (order.orderNumber || order._id || '').toString()
                  )}&code=Code128&dpi=96`}
                />
            </div>
              </div>
          </div>

          {/* Bottom Section: Product Details with Items Table */}
          <div style={{ border: '1px solid #000', marginTop: '0.002in', height: '3.6in', padding: '0.002in', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '6px', fontWeight: 'bold', marginBottom: '2px', textAlign: 'center' }}>PRODUCT DETAILS & GST BREAKDOWN</div>
            
            {/* Items Table */}
            <div style={{ marginBottom: '2px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '4px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th style={{ border: '1px solid #000', padding: '1px', textAlign: 'center', fontWeight: 'bold' }}>Item</th>
                    <th style={{ border: '1px solid #000', padding: '1px', textAlign: 'center', fontWeight: 'bold' }}>Qty</th>
                    <th style={{ border: '1px solid #000', padding: '1px', textAlign: 'center', fontWeight: 'bold' }}>Price</th>
                    <th style={{ border: '1px solid #000', padding: '1px', textAlign: 'center', fontWeight: 'bold' }}>GST%</th>
                    <th style={{ border: '1px solid #000', padding: '1px', textAlign: 'center', fontWeight: 'bold' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any, index: number) => {
                    const itemTotal = item.totalPrice || (item.price * item.quantity) || 0;
                    // Prioritize stored tax rate from order item, then productSnapshot, then product, then default
                    const gstRate = item.taxRate || item.productSnapshot?.gstRate || item.product?.gstRate || 18;
                    // Use stored tax amount if available, otherwise calculate
                    const itemTax = item.tax || (itemTotal * (gstRate / 100));
                    const totalWithGST = itemTotal + itemTax;
                    
                    return (
                      <tr key={index}>
                        <td style={{ border: '1px solid #000', padding: '1px', fontSize: '3px', textAlign: 'left' }}>
                          {item.productSnapshot?.name || item.name || 'Product'}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '1px', textAlign: 'center' }}>{item.quantity || 1}</td>
                        <td style={{ border: '1px solid #000', padding: '1px', textAlign: 'center' }}>₹{(item.price || item.unitPrice || 0).toFixed(2)}</td>
                        <td style={{ border: '1px solid #000', padding: '1px', textAlign: 'center', fontWeight: 'bold' }}>{gstRate}%</td>
                        <td style={{ border: '1px solid #000', padding: '1px', textAlign: 'center' }}>₹{totalWithGST.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Order Summary */}
            <div style={{ marginTop: '2px', fontSize: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span style={{ fontWeight: 'bold' }}>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span style={{ fontWeight: 'bold' }}>GST Total:</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span style={{ fontWeight: 'bold' }}>Shipping:</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px', borderTop: '1px solid #000', paddingTop: '1px', fontWeight: 'bold' }}>
                <span>GRAND TOTAL:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Additional Info */}
            <div style={{ marginTop: '2px', fontSize: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>HSN:</span>
                <span>{order.items?.[0]?.productSnapshot?.hsnCode || '9999'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1px' }}>
                <span style={{ fontWeight: 'bold' }}>Order No.:</span>
                <span>{(order.orderNumber || order._id) as string}</span>
              </div>
            </div>

          {/* Footer */}
            <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: '6px' }}>TAX INVOICE</div>
              <div style={{ fontSize: '3px', marginLeft: 'auto' }}>Original For Recipient</div>
          </div>
          </div>
        </div>

        {/* Separate CSS to ensure thermal label fits exactly on 4x6 page */}
        <style jsx>{`
          #thermal-label {
            width: 4in !important;
            height: 6in !important;
            max-width: 4in !important;
            max-height: 6in !important;
            min-width: 4in !important;
            min-height: 6in !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            position: relative !important;
            display: block !important;
            float: none !important;
            clear: both !important;
          }
          
          #thermal-label * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            box-sizing: border-box !important;
            max-height: none !important;
            height: auto !important;
          }
          
          @media print {
            @page {
              size: 4in 6in !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            html, body {
              width: 4in !important;
              height: 6in !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              max-width: 4in !important;
              max-height: 6in !important;
              min-width: 4in !important;
              min-height: 6in !important;
            }
            
            #thermal-label {
              width: 4in !important;
              height: 6in !important;
              max-width: 4in !important;
              max-height: 6in !important;
              min-width: 4in !important;
              min-height: 6in !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-before: avoid !important;
              page-break-after: avoid !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
              display: block !important;
              float: none !important;
              clear: both !important;
            }
            
            * {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-before: avoid !important;
              page-break-after: avoid !important;
              max-height: none !important;
              height: auto !important;
            }
          }
        `}</style>
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

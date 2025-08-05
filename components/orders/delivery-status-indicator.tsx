"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Package, Clock, CheckCircle, AlertCircle, Loader2, Eye } from "lucide-react";

interface DeliveryStatusIndicatorProps {
  order: {
    _id: string;
    status: string;
    shipping?: {
      deliveryMethod?: 'manual' | 'delhivery';
      carrier?: string;
      trackingNumber?: string;
      lastSyncAt?: string;
    };
  };
  onSyncStatus?: (orderId: string) => void;
  syncing?: boolean;
}

export function DeliveryStatusIndicator({ 
  order, 
  onSyncStatus, 
  syncing = false 
}: DeliveryStatusIndicatorProps) {
  const deliveryMethod = order.shipping?.deliveryMethod || 'manual';
  const isManual = deliveryMethod === 'manual';
  const isDelhivery = deliveryMethod === 'delhivery';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'confirmed':
        return <CheckCircle className="w-3 h-3" />;
      case 'processing':
        return <Package className="w-3 h-3" />;
      case 'shipped':
        return <Truck className="w-3 h-3" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3" />;
      case 'cancelled':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-2">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(order.status)}>
          {getStatusIcon(order.status)}
          <span className="ml-1 capitalize">{order.status}</span>
        </Badge>
        
        {/* Delivery Method Indicator */}
        {isManual && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Truck className="w-3 h-3 mr-1" />
            Manual Control
          </Badge>
        )}
        
        {isDelhivery && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Package className="w-3 h-3 mr-1" />
            Auto-Sync
          </Badge>
        )}
      </div>

      {/* Delhivery Specific Info */}
      {isDelhivery && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {order.shipping?.trackingNumber && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Tracking:</span>
              <code className="bg-muted px-1 rounded text-xs">
                {order.shipping.trackingNumber}
              </code>
            </div>
          )}
          
          {order.shipping?.lastSyncAt && (
            <div className="flex items-center gap-1">
              <span>Last sync:</span>
              <span>{formatLastSync(order.shipping.lastSyncAt)}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {isDelhivery && (
        <div className="flex items-center gap-1">
          {onSyncStatus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSyncStatus(order._id)}
              disabled={syncing}
              className="h-6 px-2 text-xs"
            >
              {syncing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Package className="w-3 h-3" />
              )}
              <span className="ml-1">Sync</span>
            </Button>
          )}
          
          {order.shipping?.trackingNumber && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://www.delhivery.com/track/package/${order.shipping?.trackingNumber}`, '_blank')}
              className="h-6 px-2 text-xs"
            >
              <Eye className="w-3 h-3" />
              <span className="ml-1">Track</span>
            </Button>
          )}
        </div>
      )}

      {/* Manual Delivery Note */}
      {isManual && (
        <div className="text-xs text-muted-foreground">
          Status updates manually controlled by admin
        </div>
      )}
    </div>
  );
}

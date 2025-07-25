"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { businessSettingsService } from "@/lib/services";
import { toast } from "sonner";
import { Loader2, Building, CreditCard, Truck, Package, RotateCcw, Bell, Settings } from "lucide-react";

export function BusinessSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await businessSettingsService.getBusinessSettings();
      setSettings(response.businessSettings);
    } catch (error) {
      toast.error('Failed to load business settings');
      console.error('Settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyInfo = async (data: any) => {
    setSaving(true);
    try {
      await businessSettingsService.updateCompanyInfo(data);
      toast.success('Company information updated successfully');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update company information');
    } finally {
      setSaving(false);
    }
  };

  const updateGSTSettings = async (data: any) => {
    setSaving(true);
    try {
      await businessSettingsService.updateGSTSettings(data);
      toast.success('GST settings updated successfully');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update GST settings');
    } finally {
      setSaving(false);
    }
  };

  const updateOrderSettings = async (data: any) => {
    setSaving(true);
    try {
      await businessSettingsService.updateOrderSettings(data);
      toast.success('Order settings updated successfully');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update order settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePaymentSettings = async (data: any) => {
    setSaving(true);
    try {
      await businessSettingsService.updatePaymentSettings(data);
      toast.success('Payment settings updated successfully');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update payment settings');
    } finally {
      setSaving(false);
    }
  };

  const updateShippingSettings = async (data: any) => {
    setSaving(true);
    try {
      await businessSettingsService.updateShippingSettings(data);
      toast.success('Shipping settings updated successfully');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update shipping settings');
    } finally {
      setSaving(false);
    }
  };

  const updateFeatureFlags = async (data: any) => {
    setSaving(true);
    try {
      await businessSettingsService.updateFeatureFlags(data);
      toast.success('Feature settings updated successfully');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update feature settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Business Settings</h1>
        <p className="text-muted-foreground">Configure your business settings and preferences.</p>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="gst" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            GST
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="returns" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Returns
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* Company Information */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    defaultValue={settings?.business?.companyName}
                    onBlur={(e) => updateCompanyInfo({ companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    defaultValue={settings?.business?.gstin}
                    onBlur={(e) => updateCompanyInfo({ gstin: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    defaultValue={settings?.business?.pan}
                    onBlur={(e) => updateCompanyInfo({ pan: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    defaultValue={settings?.general?.contactPhone}
                    onBlur={(e) => updateCompanyInfo({ contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Company Address</Label>
                <Textarea
                  id="address"
                  defaultValue={`${settings?.business?.companyAddress?.street || ''}, ${settings?.business?.companyAddress?.city || ''}, ${settings?.business?.companyAddress?.state || ''} ${settings?.business?.companyAddress?.postalCode || ''}`}
                  onBlur={(e) => {
                    const addressParts = e.target.value.split(',');
                    updateCompanyInfo({
                      companyAddress: {
                        street: addressParts[0]?.trim() || '',
                        city: addressParts[1]?.trim() || '',
                        state: addressParts[2]?.trim() || '',
                        postalCode: addressParts[3]?.trim() || ''
                      }
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GST Settings */}
        <TabsContent value="gst">
          <Card>
            <CardHeader>
              <CardTitle>GST Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableGST"
                  checked={settings?.tax?.enableGST}
                  onCheckedChange={(checked) => updateGSTSettings({ enableGST: checked })}
                />
                <Label htmlFor="enableGST">Enable GST</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultGSTRate">Default GST Rate (%)</Label>
                  <Input
                    id="defaultGSTRate"
                    type="number"
                    defaultValue={settings?.tax?.defaultGSTRate}
                    onBlur={(e) => updateGSTSettings({ defaultGSTRate: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="companyGSTIN">Company GSTIN</Label>
                  <Input
                    id="companyGSTIN"
                    defaultValue={settings?.tax?.companyGSTIN}
                    onBlur={(e) => updateGSTSettings({ companyGSTIN: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="taxCalculationMethod">Tax Calculation Method</Label>
                <Select
                  defaultValue={settings?.tax?.taxCalculationMethod}
                  onValueChange={(value) => updateGSTSettings({ taxCalculationMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inclusive">Tax Inclusive</SelectItem>
                    <SelectItem value="exclusive">Tax Exclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Order Settings */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    defaultValue={settings?.order?.minOrderAmount}
                    onBlur={(e) => updateOrderSettings({ minOrderAmount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxOrderAmount">Maximum Order Amount (₹)</Label>
                  <Input
                    id="maxOrderAmount"
                    type="number"
                    defaultValue={settings?.order?.maxOrderAmount}
                    onBlur={(e) => updateOrderSettings({ maxOrderAmount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allowGuestCheckout"
                  checked={settings?.order?.allowGuestCheckout}
                  onCheckedChange={(checked) => updateOrderSettings({ allowGuestCheckout: checked })}
                />
                <Label htmlFor="allowGuestCheckout">Allow Guest Checkout</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoConfirmOrders"
                  checked={settings?.order?.autoConfirmOrders}
                  onCheckedChange={(checked) => updateOrderSettings({ autoConfirmOrders: checked })}
                />
                <Label htmlFor="autoConfirmOrders">Auto Confirm Orders</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableCOD"
                    checked={settings?.payment?.enableCOD}
                    onCheckedChange={(checked) => updatePaymentSettings({ enableCOD: checked })}
                  />
                  <Label htmlFor="enableCOD">Enable Cash on Delivery</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableOnlinePayment"
                    checked={settings?.payment?.enableOnlinePayment}
                    onCheckedChange={(checked) => updatePaymentSettings({ enableOnlinePayment: checked })}
                  />
                  <Label htmlFor="enableOnlinePayment">Enable Online Payment</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableWalletPayment"
                    checked={settings?.payment?.enableWalletPayment}
                    onCheckedChange={(checked) => updatePaymentSettings({ enableWalletPayment: checked })}
                  />
                  <Label htmlFor="enableWalletPayment">Enable Wallet Payment</Label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="codCharges">COD Charges (₹)</Label>
                  <Input
                    id="codCharges"
                    type="number"
                    defaultValue={settings?.payment?.codCharges}
                    onBlur={(e) => updatePaymentSettings({ codCharges: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="codMinAmount">COD Min Amount (₹)</Label>
                  <Input
                    id="codMinAmount"
                    type="number"
                    defaultValue={settings?.payment?.codMinAmount}
                    onBlur={(e) => updatePaymentSettings({ codMinAmount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="codMaxAmount">COD Max Amount (₹)</Label>
                  <Input
                    id="codMaxAmount"
                    type="number"
                    defaultValue={settings?.payment?.codMaxAmount}
                    onBlur={(e) => updatePaymentSettings({ codMaxAmount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add more tabs for shipping, returns, and features */}
      </Tabs>
    </div>
  );
}

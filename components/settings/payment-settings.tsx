"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface PaymentSettings {
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  codEnabled: boolean;
  upiEnabled: boolean;
  upiId: string;
}

interface PaymentSettingsProps {
  settings: PaymentSettings;
  onChange: (settings: PaymentSettings) => void;
}

export function PaymentSettings({ settings, onChange }: PaymentSettingsProps) {
  const updateSetting = (key: keyof PaymentSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <>
      {/* Razorpay Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Razorpay Integration</CardTitle>
            <Badge variant={settings.razorpayEnabled ? "default" : "secondary"}>
              {settings.razorpayEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Razorpay</h4>
              <p className="text-sm text-slate-600">Accept online payments via Razorpay</p>
            </div>
            <Switch
              checked={settings.razorpayEnabled}
              onCheckedChange={(checked) => updateSetting('razorpayEnabled', checked)}
            />
          </div>
          
          {settings.razorpayEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Razorpay Key ID</label>
                <Input
                  value={settings.razorpayKeyId}
                  onChange={(e) => updateSetting('razorpayKeyId', e.target.value)}
                  placeholder="rzp_test_xxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Razorpay Key Secret</label>
                <Input
                  type="password"
                  value={settings.razorpayKeySecret}
                  onChange={(e) => updateSetting('razorpayKeySecret', e.target.value)}
                  placeholder="Enter your Razorpay key secret"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Other Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Other Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Cash on Delivery (COD)</h4>
              <p className="text-sm text-slate-600">Allow customers to pay on delivery</p>
            </div>
            <Switch
              checked={settings.codEnabled}
              onCheckedChange={(checked) => updateSetting('codEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">UPI Payments</h4>
              <p className="text-sm text-slate-600">Accept UPI payments directly</p>
            </div>
            <Switch
              checked={settings.upiEnabled}
              onCheckedChange={(checked) => updateSetting('upiEnabled', checked)}
            />
          </div>

          {settings.upiEnabled && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">UPI ID</label>
              <Input
                value={settings.upiId}
                onChange={(e) => updateSetting('upiId', e.target.value)}
                placeholder="yourstore@upi"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Security */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">SSL Certificate</h4>
            <p className="text-sm text-green-700">Your store is secured with SSL encryption</p>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">PCI Compliance</h4>
            <p className="text-sm text-blue-700">All payment data is processed securely through certified payment gateways</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

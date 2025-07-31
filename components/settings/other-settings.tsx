"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// Shipping Settings Component
interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  internationalShipping: boolean;
  estimatedDeliveryDays: number;
}

interface ShippingSettingsProps {
  settings: ShippingSettings;
  onChange: (settings: ShippingSettings) => void;
}

export function ShippingSettings({ settings, onChange }: ShippingSettingsProps) {
  const updateSetting = (key: keyof ShippingSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Shipping Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Free Shipping Threshold (₹)</label>
              <Input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => updateSetting('freeShippingThreshold', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Standard Shipping Cost (₹)</label>
              <Input
                type="number"
                value={settings.standardShippingCost}
                onChange={(e) => updateSetting('standardShippingCost', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Express Shipping Cost (₹)</label>
              <Input
                type="number"
                value={settings.expressShippingCost}
                onChange={(e) => updateSetting('expressShippingCost', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Delivery (Days)</label>
              <Input
                type="number"
                value={settings.estimatedDeliveryDays}
                onChange={(e) => updateSetting('estimatedDeliveryDays', Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">International Shipping</h4>
              <p className="text-sm text-slate-600">Enable shipping to international destinations</p>
            </div>
            <Switch
              checked={settings.internationalShipping}
              onCheckedChange={(checked) => updateSetting('internationalShipping', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Notification Settings Component
interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotionalEmails: boolean;
  lowStockAlerts: boolean;
}

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
}

export function NotificationSettings({ settings, onChange }: NotificationSettingsProps) {
  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-slate-600">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">SMS Notifications</h4>
              <p className="text-sm text-slate-600">Receive notifications via SMS</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Order Updates</h4>
              <p className="text-sm text-slate-600">Get notified about order status changes</p>
            </div>
            <Switch
              checked={settings.orderUpdates}
              onCheckedChange={(checked) => updateSetting('orderUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Promotional Emails</h4>
              <p className="text-sm text-slate-600">Receive marketing and promotional emails</p>
            </div>
            <Switch
              checked={settings.promotionalEmails}
              onCheckedChange={(checked) => updateSetting('promotionalEmails', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Low Stock Alerts</h4>
              <p className="text-sm text-slate-600">Get alerted when products are low in stock</p>
            </div>
            <Switch
              checked={settings.lowStockAlerts}
              onCheckedChange={(checked) => updateSetting('lowStockAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Security Settings Component
interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
  };
}

interface SecuritySettingsProps {
  settings: SecuritySettings;
  onChange: (settings: SecuritySettings) => void;
}

export function SecuritySettings({ settings, onChange }: SecuritySettingsProps) {
  const updateSetting = (key: keyof SecuritySettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const updatePasswordPolicy = (key: keyof SecuritySettings['passwordPolicy'], value: any) => {
    onChange({
      ...settings,
      passwordPolicy: { ...settings.passwordPolicy, [key]: value }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
            <Input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => updateSetting('sessionTimeout', Number(e.target.value))}
            />
          </div>

          <div>
            <h4 className="font-medium mb-3">Password Policy</h4>
            <div className="space-y-3 pl-4 border-l-2 border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Length</label>
                <Input
                  type="number"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => updatePasswordPolicy('minLength', Number(e.target.value))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Require Special Characters</h5>
                  <p className="text-sm text-slate-600">Password must contain special characters</p>
                </div>
                <Switch
                  checked={settings.passwordPolicy.requireSpecialChars}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireSpecialChars', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Require Numbers</h5>
                  <p className="text-sm text-slate-600">Password must contain numbers</p>
                </div>
                <Switch
                  checked={settings.passwordPolicy.requireNumbers}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireNumbers', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// API Settings Component
interface ApiSettings {
  webhookUrl: string;
  apiRateLimit: number;
  allowedOrigins: string[];
}

interface ApiSettingsProps {
  settings: ApiSettings;
  onChange: (settings: ApiSettings) => void;
}

export function ApiSettings({ settings, onChange }: ApiSettingsProps) {
  const updateSetting = (key: keyof ApiSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Webhook URL</label>
            <Input
              value={settings.webhookUrl}
              onChange={(e) => updateSetting('webhookUrl', e.target.value)}
              placeholder="https://yourstore.com/webhook"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">API Rate Limit (requests/minute)</label>
            <Input
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) => updateSetting('apiRateLimit', Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Allowed Origins</label>
            <div className="space-y-2">
              {settings.allowedOrigins.map((origin, index) => (
                <Input
                  key={index}
                  value={origin}
                  onChange={(e) => {
                    const newOrigins = [...settings.allowedOrigins];
                    newOrigins[index] = e.target.value;
                    updateSetting('allowedOrigins', newOrigins);
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

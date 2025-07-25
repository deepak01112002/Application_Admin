"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StoreSettings {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
  logo?: string;
}

interface GeneralSettingsProps {
  settings: StoreSettings;
  onChange: (settings: StoreSettings) => void;
}

export function GeneralSettings({ settings, onChange }: GeneralSettingsProps) {
  const updateSetting = (key: keyof StoreSettings, value: string) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <>
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Store Name</label>
            <Input
              value={settings.name}
              onChange={(e) => updateSetting('name', e.target.value)}
              placeholder="Enter store name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Store Description</label>
            <textarea
              value={settings.description}
              onChange={(e) => updateSetting('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe your store"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
              <select 
                value={settings.currency}
                onChange={(e) => updateSetting('currency', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
              <select 
                value={settings.timezone}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email</label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => updateSetting('email', e.target.value)}
                placeholder="contact@yourstore.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <Input
                type="tel"
                value={settings.phone}
                onChange={(e) => updateSetting('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Store Address</label>
            <textarea
              value={settings.address}
              onChange={(e) => updateSetting('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your complete store address"
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { day: "Monday", open: "09:00", close: "18:00", closed: false },
              { day: "Tuesday", open: "09:00", close: "18:00", closed: false },
              { day: "Wednesday", open: "09:00", close: "18:00", closed: false },
              { day: "Thursday", open: "09:00", close: "18:00", closed: false },
              { day: "Friday", open: "09:00", close: "18:00", closed: false },
              { day: "Saturday", open: "09:00", close: "16:00", closed: false },
              { day: "Sunday", open: "", close: "", closed: true },
            ].map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700 w-20">{schedule.day}</span>
                {schedule.closed ? (
                  <span className="text-red-600 font-medium">Closed</span>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      defaultValue={schedule.open}
                      className="px-3 py-1 border border-slate-200 rounded text-sm"
                    />
                    <span className="text-slate-500">to</span>
                    <input
                      type="time"
                      defaultValue={schedule.close}
                      className="px-3 py-1 border border-slate-200 rounded text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

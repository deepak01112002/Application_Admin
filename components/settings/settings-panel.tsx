"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Key,
  Save,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { GeneralSettings } from "./general-settings";
import { PaymentSettings } from "./payment-settings";
import { ShippingSettings, NotificationSettings, SecuritySettings, ApiSettings } from "./other-settings";

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

interface PaymentSettings {
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  codEnabled: boolean;
  upiEnabled: boolean;
  upiId: string;
}

interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  internationalShipping: boolean;
  estimatedDeliveryDays: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotionalEmails: boolean;
  lowStockAlerts: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
  };
}

interface ApiSettings {
  webhookUrl: string;
  apiRateLimit: number;
  allowedOrigins: string[];
}

type SettingsSection = 'general' | 'payment' | 'shipping' | 'notifications' | 'security' | 'api';

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [loading, setLoading] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    razorpayEnabled: false,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    codEnabled: true,
    upiEnabled: false,
    upiId: ''
  });

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingThreshold: 500,
    standardShippingCost: 50,
    expressShippingCost: 100,
    internationalShipping: false,
    estimatedDeliveryDays: 5
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotionalEmails: false,
    lowStockAlerts: true
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireSpecialChars: true,
      requireNumbers: true
    }
  });

  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    webhookUrl: '',
    apiRateLimit: 100,
    allowedOrigins: ['http://localhost:3000', 'http://localhost:3001']
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Load settings from API
      // For now, we'll use default values
      setStoreSettings({
        name: 'Ghanshyam Murti Bhandar',
        description: 'Premium religious idols and spiritual items for your devotional needs.',
        email: 'info@ghanshyammurtibhandar.com',
        phone: '+91 98765 43210',
        address: '123 Temple Street, Religious Quarter, Mumbai, Maharashtra 400001, India',
        currency: 'INR',
        timezone: 'Asia/Kolkata'
      });
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      // Save settings to API based on active section
      const settingsData = {
        general: storeSettings,
        payment: paymentSettings,
        shipping: shippingSettings,
        notifications: notificationSettings,
        security: securitySettings,
        api: apiSettings
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const settingsSections = [
    { id: 'general' as SettingsSection, name: 'General', icon: Settings, color: 'text-blue-600' },
    { id: 'payment' as SettingsSection, name: 'Payment', icon: CreditCard, color: 'text-green-600' },
    { id: 'shipping' as SettingsSection, name: 'Shipping', icon: Truck, color: 'text-orange-600' },
    { id: 'notifications' as SettingsSection, name: 'Notifications', icon: Bell, color: 'text-purple-600' },
    { id: 'security' as SettingsSection, name: 'Security', icon: Shield, color: 'text-red-600' },
    { id: 'api' as SettingsSection, name: 'API Keys', icon: Key, color: 'text-gray-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Configure your store settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Settings Categories</h3>
          <div className="space-y-2">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                  activeSection === section.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <section.icon className={`w-5 h-5 ${section.color}`} />
                <span>{section.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'general' && (
            <GeneralSettings 
              settings={storeSettings} 
              onChange={setStoreSettings}
            />
          )}
          
          {activeSection === 'payment' && (
            <PaymentSettings 
              settings={paymentSettings} 
              onChange={setPaymentSettings}
            />
          )}
          
          {activeSection === 'shipping' && (
            <ShippingSettings 
              settings={shippingSettings} 
              onChange={setShippingSettings}
            />
          )}
          
          {activeSection === 'notifications' && (
            <NotificationSettings 
              settings={notificationSettings} 
              onChange={setNotificationSettings}
            />
          )}
          
          {activeSection === 'security' && (
            <SecuritySettings 
              settings={securitySettings} 
              onChange={setSecuritySettings}
            />
          )}
          
          {activeSection === 'api' && (
            <ApiSettings 
              settings={apiSettings} 
              onChange={setApiSettings}
            />
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={saveSettings}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

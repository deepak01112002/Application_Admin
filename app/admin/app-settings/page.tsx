'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Power, 
  PowerOff, 
  Wrench, 
  Clock, 
  ShoppingCart, 
  Truck, 
  Phone, 
  Smartphone, 
  ToggleLeft, 
  ToggleRight,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { appSettingsService } from '@/lib/services';
import { toast } from 'sonner';

interface AppSettings {
  isApplicationActive: boolean;
  maintenanceMode: boolean;
  currentStatus: string;
  inactiveMessage: {
    title: string;
    message: string;
    showContactInfo: boolean;
  };
  businessHours: {
    enabled: boolean;
    timezone: string;
    schedule: {
      [key: string]: {
        open: string;
        close: string;
        isOpen: boolean;
      };
    };
    outsideHoursMessage: string;
  };
  orderSettings: {
    allowOrders: boolean;
    minOrderAmount: number;
    maxOrderAmount: number;
    allowCOD: boolean;
    allowOnlinePayment: boolean;
  };
  deliverySettings: {
    allowDelivery: boolean;
    freeDeliveryThreshold: number;
    deliveryCharges: number;
    estimatedDeliveryDays: {
      min: number;
      max: number;
    };
  };
  contactInfo: {
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
  };
  appVersion: {
    current: string;
    minimum: string;
    forceUpdate: boolean;
    updateMessage: string;
  };
  features: {
    enableWishlist: boolean;
    enableReviews: boolean;
    enableReferral: boolean;
    enableLoyaltyPoints: boolean;
    enableChat: boolean;
    enableNotifications: boolean;
  };
}

const AppSettingsManagement = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('status');

  useEffect(() => {
    fetchAppSettings();
  }, []);

  const fetchAppSettings = async () => {
    try {
      setLoading(true);
      const response = await appSettingsService.getAllAppSettings();

      // Ensure all required fields have default values
      const defaultSettings: AppSettings = {
        isApplicationActive: true,
        maintenanceMode: false,
        currentStatus: 'active',
        inactiveMessage: {
          title: 'Application Temporarily Unavailable',
          message: 'We are currently updating our services. Please check back later.',
          showContactInfo: true
        },
        businessHours: {
          enabled: false,
          timezone: 'Asia/Kolkata',
          schedule: {
            monday: { open: '09:00', close: '18:00', isOpen: true },
            tuesday: { open: '09:00', close: '18:00', isOpen: true },
            wednesday: { open: '09:00', close: '18:00', isOpen: true },
            thursday: { open: '09:00', close: '18:00', isOpen: true },
            friday: { open: '09:00', close: '18:00', isOpen: true },
            saturday: { open: '09:00', close: '18:00', isOpen: true },
            sunday: { open: '09:00', close: '18:00', isOpen: false }
          },
          outsideHoursMessage: 'We are currently closed. Please visit us during business hours.'
        },
        orderSettings: {
          allowOrders: true,
          minOrderAmount: 0,
          maxOrderAmount: 100000,
          allowCOD: true,
          allowOnlinePayment: true
        },
        deliverySettings: {
          allowDelivery: true,
          freeDeliveryThreshold: 500,
          deliveryCharges: 50,
          estimatedDeliveryDays: { min: 1, max: 7 }
        },
        contactInfo: {
          phone: '',
          email: '',
          whatsapp: '',
          address: ''
        },
        appVersion: {
          current: '1.0.0',
          minimum: '1.0.0',
          forceUpdate: false,
          updateMessage: 'Please update your app to the latest version for better experience.'
        },
        features: {
          enableWishlist: true,
          enableReviews: true,
          enableReferral: false,
          enableLoyaltyPoints: false,
          enableChat: true,
          enableNotifications: true
        }
      };

      // Merge response with defaults
      const mergedSettings = {
        ...defaultSettings,
        ...response.settings,
        contactInfo: {
          ...defaultSettings.contactInfo,
          ...response.settings?.contactInfo
        },
        orderSettings: {
          ...defaultSettings.orderSettings,
          ...response.settings?.orderSettings
        },
        deliverySettings: {
          ...defaultSettings.deliverySettings,
          ...response.settings?.deliverySettings
        },
        features: {
          ...defaultSettings.features,
          ...response.settings?.features
        },
        appVersion: {
          ...defaultSettings.appVersion,
          ...response.settings?.appVersion
        },
        businessHours: {
          ...defaultSettings.businessHours,
          ...response.settings?.businessHours,
          schedule: {
            ...defaultSettings.businessHours.schedule,
            ...response.settings?.businessHours?.schedule
          }
        },
        inactiveMessage: {
          ...defaultSettings.inactiveMessage,
          ...response.settings?.inactiveMessage
        }
      };

      setSettings(mergedSettings);
    } catch (error) {
      console.error('Error fetching app settings:', error);
      toast.error('Failed to fetch app settings');

      // Set default settings on error
      setSettings({
        isApplicationActive: true,
        maintenanceMode: false,
        currentStatus: 'active',
        inactiveMessage: {
          title: 'Application Temporarily Unavailable',
          message: 'We are currently updating our services. Please check back later.',
          showContactInfo: true
        },
        businessHours: {
          enabled: false,
          timezone: 'Asia/Kolkata',
          schedule: {
            monday: { open: '09:00', close: '18:00', isOpen: true },
            tuesday: { open: '09:00', close: '18:00', isOpen: true },
            wednesday: { open: '09:00', close: '18:00', isOpen: true },
            thursday: { open: '09:00', close: '18:00', isOpen: true },
            friday: { open: '09:00', close: '18:00', isOpen: true },
            saturday: { open: '09:00', close: '18:00', isOpen: true },
            sunday: { open: '09:00', close: '18:00', isOpen: false }
          },
          outsideHoursMessage: 'We are currently closed. Please visit us during business hours.'
        },
        orderSettings: {
          allowOrders: true,
          minOrderAmount: 0,
          maxOrderAmount: 100000,
          allowCOD: true,
          allowOnlinePayment: true
        },
        deliverySettings: {
          allowDelivery: true,
          freeDeliveryThreshold: 500,
          deliveryCharges: 50,
          estimatedDeliveryDays: { min: 1, max: 7 }
        },
        contactInfo: {
          phone: '',
          email: '',
          whatsapp: '',
          address: ''
        },
        appVersion: {
          current: '1.0.0',
          minimum: '1.0.0',
          forceUpdate: false,
          updateMessage: 'Please update your app to the latest version for better experience.'
        },
        features: {
          enableWishlist: true,
          enableReviews: true,
          enableReferral: false,
          enableLoyaltyPoints: false,
          enableChat: true,
          enableNotifications: true
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApplicationStatus = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const newStatus = !settings.isApplicationActive;
      await appSettingsService.toggleApplicationStatus(newStatus, 
        newStatus ? 'Application activated by admin' : 'Application deactivated by admin'
      );
      
      setSettings({
        ...settings,
        isApplicationActive: newStatus,
        currentStatus: newStatus ? 'active' : 'inactive'
      });
      
      toast.success(`Application ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling application status:', error);
      toast.error('Failed to update application status');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenanceMode = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const newMode = !settings.maintenanceMode;
      await appSettingsService.toggleMaintenanceMode(newMode, 
        newMode ? 'System maintenance in progress' : 'Maintenance completed'
      );
      
      setSettings({
        ...settings,
        maintenanceMode: newMode,
        currentStatus: newMode ? 'maintenance' : (settings.isApplicationActive ? 'active' : 'inactive')
      });
      
      toast.success(`Maintenance mode ${newMode ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast.error('Failed to update maintenance mode');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSettings = async (section: string, data: any) => {
    if (!settings) return;

    try {
      setSaving(true);
      
      switch (section) {
        case 'orderSettings':
          await appSettingsService.updateOrderSettings(data);
          setSettings({ ...settings, orderSettings: { ...settings.orderSettings, ...data } });
          break;
        case 'deliverySettings':
          await appSettingsService.updateDeliverySettings(data);
          setSettings({ ...settings, deliverySettings: { ...settings.deliverySettings, ...data } });
          break;
        case 'contactInfo':
          await appSettingsService.updateContactInfo(data);
          setSettings({ ...settings, contactInfo: { ...settings.contactInfo, ...data } });
          break;
        case 'features':
          await appSettingsService.updateFeatures(data);
          setSettings({ ...settings, features: { ...settings.features, ...data } });
          break;
        case 'appVersion':
          await appSettingsService.updateAppVersion(data);
          setSettings({ ...settings, appVersion: { ...settings.appVersion, ...data } });
          break;
        default:
          await appSettingsService.updateAppSettings({ [section]: data });
          setSettings({ ...settings, [section]: data });
      }
      
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5" />;
      case 'inactive': return <XCircle className="h-5 w-5" />;
      case 'maintenance': return <AlertTriangle className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Settings</h2>
          <p className="text-gray-600 mb-4">Unable to fetch application settings</p>
          <button
            onClick={fetchAppSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'status', name: 'App Status', icon: Power },
    { id: 'orders', name: 'Order Settings', icon: ShoppingCart },
    { id: 'delivery', name: 'Delivery Settings', icon: Truck },
    { id: 'contact', name: 'Contact Info', icon: Phone },
    { id: 'features', name: 'Features', icon: ToggleLeft },
    { id: 'version', name: 'App Version', icon: Smartphone }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Settings</h1>
          <p className="text-gray-600 mt-2">Manage your application configuration and status</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(settings.currentStatus)}`}>
            {getStatusIcon(settings.currentStatus)}
            <span className="capitalize">{settings.currentStatus}</span>
          </div>
          <button
            onClick={fetchAppSettings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Application Status</h3>
            <button
              onClick={handleToggleApplicationStatus}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                settings.isApplicationActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              } disabled:opacity-50`}
            >
              {settings.isApplicationActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
              {settings.isApplicationActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {settings.isApplicationActive 
              ? 'Users can access the application and place orders'
              : 'Application is inactive - users will see a popup message'
            }
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Maintenance Mode</h3>
            <button
              onClick={handleToggleMaintenanceMode}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                settings.maintenanceMode
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              } disabled:opacity-50`}
            >
              <Wrench className="h-4 w-4" />
              {settings.maintenanceMode ? 'Disable' : 'Enable'}
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {settings.maintenanceMode 
              ? 'System is under maintenance - limited functionality'
              : 'System is operating normally'
            }
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Current Version</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              v{settings.appVersion.current}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Minimum required: v{settings.appVersion.minimum}
          </p>
          {settings.appVersion.forceUpdate && (
            <p className="text-xs text-orange-600 mt-1">Force update enabled</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'status' && <StatusTab settings={settings} onUpdate={handleUpdateSettings} saving={saving} />}
          {activeTab === 'orders' && <OrderSettingsTab settings={settings} onUpdate={handleUpdateSettings} saving={saving} />}
          {activeTab === 'delivery' && <DeliverySettingsTab settings={settings} onUpdate={handleUpdateSettings} saving={saving} />}
          {activeTab === 'contact' && <ContactInfoTab settings={settings} onUpdate={handleUpdateSettings} saving={saving} />}
          {activeTab === 'features' && <FeaturesTab settings={settings} onUpdate={handleUpdateSettings} saving={saving} />}
          {activeTab === 'version' && <AppVersionTab settings={settings} onUpdate={handleUpdateSettings} saving={saving} />}
        </div>
      </div>
    </div>
  );
};

// Status Tab Component
const StatusTab = ({ settings, onUpdate, saving }: { settings: AppSettings; onUpdate: (section: string, data: any) => void; saving: boolean }) => {
  const [inactiveMessage, setInactiveMessage] = useState(settings.inactiveMessage);

  const handleSave = () => {
    onUpdate('inactiveMessage', inactiveMessage);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inactive Message Title
              </label>
              <input
                type="text"
                value={inactiveMessage.title}
                onChange={(e) => setInactiveMessage({ ...inactiveMessage, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Application Temporarily Unavailable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inactive Message
              </label>
              <textarea
                value={inactiveMessage.message}
                onChange={(e) => setInactiveMessage({ ...inactiveMessage, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="We are currently updating our services. Please check back later."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showContactInfo"
                checked={inactiveMessage.showContactInfo}
                onChange={(e) => setInactiveMessage({ ...inactiveMessage, showContactInfo: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showContactInfo" className="ml-2 block text-sm text-gray-700">
                Show contact information in popup
              </label>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h5 className="font-semibold text-gray-900 mb-2">{inactiveMessage.title}</h5>
              <p className="text-gray-600 text-sm mb-3">{inactiveMessage.message}</p>
              {inactiveMessage.showContactInfo && (
                <div className="text-xs text-gray-500">
                  <p>Contact information will be displayed here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Order Settings Tab Component
const OrderSettingsTab = ({ settings, onUpdate, saving }: { settings: AppSettings; onUpdate: (section: string, data: any) => void; saving: boolean }) => {
  const [orderSettings, setOrderSettings] = useState(settings.orderSettings || {
    allowOrders: true,
    minOrderAmount: 0,
    maxOrderAmount: 100000,
    allowCOD: true,
    allowOnlinePayment: true
  });

  const handleSave = () => {
    onUpdate('orderSettings', orderSettings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowOrders"
                checked={orderSettings.allowOrders}
                onChange={(e) => setOrderSettings({ ...orderSettings, allowOrders: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowOrders" className="ml-2 block text-sm text-gray-700">
                Allow new orders
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Amount (₹)
              </label>
              <input
                type="number"
                value={orderSettings.minOrderAmount}
                onChange={(e) => setOrderSettings({ ...orderSettings, minOrderAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Order Amount (₹)
              </label>
              <input
                type="number"
                value={orderSettings.maxOrderAmount}
                onChange={(e) => setOrderSettings({ ...orderSettings, maxOrderAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowCOD"
                checked={orderSettings.allowCOD}
                onChange={(e) => setOrderSettings({ ...orderSettings, allowCOD: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowCOD" className="ml-2 block text-sm text-gray-700">
                Allow Cash on Delivery (COD)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowOnlinePayment"
                checked={orderSettings.allowOnlinePayment}
                onChange={(e) => setOrderSettings({ ...orderSettings, allowOnlinePayment: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowOnlinePayment" className="ml-2 block text-sm text-gray-700">
                Allow Online Payment
              </label>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Order Summary</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Orders: {orderSettings.allowOrders ? 'Enabled' : 'Disabled'}</li>
                <li>• Min Amount: ₹{orderSettings.minOrderAmount}</li>
                <li>• Max Amount: ₹{orderSettings.maxOrderAmount}</li>
                <li>• COD: {orderSettings.allowCOD ? 'Available' : 'Disabled'}</li>
                <li>• Online Payment: {orderSettings.allowOnlinePayment ? 'Available' : 'Disabled'}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Delivery Settings Tab Component
const DeliverySettingsTab = ({ settings, onUpdate, saving }: { settings: AppSettings; onUpdate: (section: string, data: any) => void; saving: boolean }) => {
  const [deliverySettings, setDeliverySettings] = useState(settings.deliverySettings || {
    allowDelivery: true,
    freeDeliveryThreshold: 500,
    deliveryCharges: 50,
    estimatedDeliveryDays: { min: 1, max: 7 }
  });

  const handleSave = () => {
    onUpdate('deliverySettings', deliverySettings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowDelivery"
                checked={deliverySettings.allowDelivery}
                onChange={(e) => setDeliverySettings({ ...deliverySettings, allowDelivery: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowDelivery" className="ml-2 block text-sm text-gray-700">
                Allow delivery service
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Delivery Threshold (₹)
              </label>
              <input
                type="number"
                value={deliverySettings.freeDeliveryThreshold}
                onChange={(e) => setDeliverySettings({ ...deliverySettings, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Charges (₹)
              </label>
              <input
                type="number"
                value={deliverySettings.deliveryCharges}
                onChange={(e) => setDeliverySettings({ ...deliverySettings, deliveryCharges: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Delivery Days (Min)
              </label>
              <input
                type="number"
                value={deliverySettings.estimatedDeliveryDays.min}
                onChange={(e) => setDeliverySettings({
                  ...deliverySettings,
                  estimatedDeliveryDays: {
                    ...deliverySettings.estimatedDeliveryDays,
                    min: parseInt(e.target.value) || 1
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Delivery Days (Max)
              </label>
              <input
                type="number"
                value={deliverySettings.estimatedDeliveryDays.max}
                onChange={(e) => setDeliverySettings({
                  ...deliverySettings,
                  estimatedDeliveryDays: {
                    ...deliverySettings.estimatedDeliveryDays,
                    max: parseInt(e.target.value) || 1
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Delivery Summary</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Service: {deliverySettings.allowDelivery ? 'Available' : 'Disabled'}</li>
                <li>• Free above: ₹{deliverySettings.freeDeliveryThreshold}</li>
                <li>• Charges: ₹{deliverySettings.deliveryCharges}</li>
                <li>• Timeline: {deliverySettings.estimatedDeliveryDays.min}-{deliverySettings.estimatedDeliveryDays.max} days</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Contact Info Tab Component
const ContactInfoTab = ({ settings, onUpdate, saving }: { settings: AppSettings; onUpdate: (section: string, data: any) => void; saving: boolean }) => {
  const [contactInfo, setContactInfo] = useState(settings.contactInfo || {
    phone: '',
    email: '',
    whatsapp: '',
    address: ''
  });

  useEffect(() => {
    if (settings.contactInfo) {
      setContactInfo({
        phone: settings.contactInfo.phone || '',
        email: settings.contactInfo.email || '',
        whatsapp: settings.contactInfo.whatsapp || '',
        address: settings.contactInfo.address || ''
      });
    }
  }, [settings.contactInfo]);

  const handleSave = () => {
    onUpdate('contactInfo', contactInfo);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={contactInfo.whatsapp}
                onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address
              </label>
              <textarea
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Enter your complete business address"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Contact Preview</h4>
            <div className="space-y-3 text-sm">
              {contactInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{contactInfo.phone}</span>
                </div>
              )}
              {contactInfo.email && (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 text-gray-500">✉️</span>
                  <span>{contactInfo.email}</span>
                </div>
              )}
              {contactInfo.whatsapp && (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 text-gray-500">💬</span>
                  <span>{contactInfo.whatsapp}</span>
                </div>
              )}
              {contactInfo.address && (
                <div className="flex items-start gap-2">
                  <span className="h-4 w-4 text-gray-500 mt-0.5">📍</span>
                  <span className="text-xs leading-relaxed">{contactInfo.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Features Tab Component
const FeaturesTab = ({ settings, onUpdate, saving }: { settings: AppSettings; onUpdate: (section: string, data: any) => void; saving: boolean }) => {
  const [features, setFeatures] = useState(settings.features);

  const handleSave = () => {
    onUpdate('features', features);
  };

  const featuresList = [
    { key: 'enableWishlist', label: 'Wishlist', description: 'Allow users to save products to wishlist' },
    { key: 'enableReviews', label: 'Product Reviews', description: 'Enable product reviews and ratings' },
    { key: 'enableReferral', label: 'Referral Program', description: 'Enable user referral system' },
    { key: 'enableLoyaltyPoints', label: 'Loyalty Points', description: 'Enable loyalty points system' },
    { key: 'enableChat', label: 'Live Chat', description: 'Enable customer support chat' },
    { key: 'enableNotifications', label: 'Push Notifications', description: 'Enable push notifications' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Flags</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuresList.map((feature) => (
            <div key={feature.key} className="flex items-start space-x-3 p-4 border rounded-lg">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id={feature.key}
                  checked={features[feature.key as keyof typeof features]}
                  onChange={(e) => setFeatures({ ...features, [feature.key]: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex-1">
                <label htmlFor={feature.key} className="block text-sm font-medium text-gray-900 cursor-pointer">
                  {feature.label}
                </label>
                <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
              </div>
              <div className="flex items-center">
                {features[feature.key as keyof typeof features] ? (
                  <ToggleRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// App Version Tab Component
const AppVersionTab = ({ settings, onUpdate, saving }: { settings: AppSettings; onUpdate: (section: string, data: any) => void; saving: boolean }) => {
  const [appVersion, setAppVersion] = useState(settings.appVersion);

  const handleSave = () => {
    onUpdate('appVersion', appVersion);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">App Version Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Version
              </label>
              <input
                type="text"
                value={appVersion.current}
                onChange={(e) => setAppVersion({ ...appVersion, current: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1.0.0"
                pattern="^\d+\.\d+\.\d+$"
              />
              <p className="text-xs text-gray-500 mt-1">Format: major.minor.patch (e.g., 1.0.0)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Required Version
              </label>
              <input
                type="text"
                value={appVersion.minimum}
                onChange={(e) => setAppVersion({ ...appVersion, minimum: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1.0.0"
                pattern="^\d+\.\d+\.\d+$"
              />
              <p className="text-xs text-gray-500 mt-1">Users below this version will be prompted to update</p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="forceUpdate"
                checked={appVersion.forceUpdate}
                onChange={(e) => setAppVersion({ ...appVersion, forceUpdate: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="forceUpdate" className="ml-2 block text-sm text-gray-700">
                Force update (users cannot skip)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Message
              </label>
              <textarea
                value={appVersion.updateMessage}
                onChange={(e) => setAppVersion({ ...appVersion, updateMessage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Please update your app to the latest version for better experience."
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Version Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Current:</span>
                <span className="font-mono text-blue-900">v{appVersion.current}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Minimum:</span>
                <span className="font-mono text-blue-900">v{appVersion.minimum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Force Update:</span>
                <span className={`font-medium ${appVersion.forceUpdate ? 'text-red-600' : 'text-green-600'}`}>
                  {appVersion.forceUpdate ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {appVersion.updateMessage && (
              <div className="mt-4 p-3 bg-white rounded border">
                <p className="text-xs text-gray-600 mb-1">Update Message Preview:</p>
                <p className="text-sm text-gray-900">{appVersion.updateMessage}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppSettingsManagement;

"use client";

import { useState, useEffect } from 'react';
import { Bell, BellRing, Settings, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notificationService } from '@/lib/notification-service';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'new_order' | 'order_update' | 'low_stock' | 'system';
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  orderId?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Initialize notification service
    initializeNotifications();
    
    // Load existing notifications from localStorage
    loadStoredNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
      setIsEnabled(notificationService.isEnabled());
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const loadStoredNotifications = () => {
    try {
      const stored = localStorage.getItem('admin_notifications');
      if (stored) {
        const parsedNotifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to load stored notifications:', error);
    }
  };

  const saveNotifications = (newNotifications: Notification[]) => {
    try {
      localStorage.setItem('admin_notifications', JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    const updatedNotifications = [newNotification, ...notifications].slice(0, 50); // Keep only last 50
    setNotifications(updatedNotifications);
    setUnreadCount(prev => prev + 1);
    saveNotifications(updatedNotifications);
  };

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    setUnreadCount(prev => Math.max(0, prev - 1));
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('admin_notifications');
    toast.success('All notifications cleared');
  };

  const handleTestNotification = async () => {
    await notificationService.sendTestNotification();
    
    // Add to local notifications as well
    addNotification({
      type: 'system',
      title: '🧪 Test Notification',
      body: 'This is a test notification to verify the system is working!'
    });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order': return '🛒';
      case 'order_update': return '📦';
      case 'low_stock': return '⚠️';
      case 'system': return '🔧';
      default: return '🔔';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTestNotification}
              className="h-6 px-2"
            >
              <TestTube className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="h-6 px-2"
            >
              Mark all read
            </Button>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {!isEnabled && (
          <div className="p-3 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Notifications are disabled</p>
            <Button 
              size="sm" 
              onClick={initializeNotifications}
              className="mt-2"
            >
              Enable Notifications
            </Button>
          </div>
        )}
        
        {isEnabled && notifications.length === 0 && (
          <div className="p-3 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        )}
        
        {isEnabled && notifications.length > 0 && (
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.orderId) {
                    window.location.href = `/orders?highlight=${notification.orderId}`;
                  }
                }}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            
            {notifications.length > 10 && (
              <DropdownMenuItem className="text-center text-sm text-muted-foreground">
                +{notifications.length - 10} more notifications
              </DropdownMenuItem>
            )}
          </div>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={clearAllNotifications}
              className="text-center text-sm text-red-600 hover:text-red-700"
            >
              Clear All Notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

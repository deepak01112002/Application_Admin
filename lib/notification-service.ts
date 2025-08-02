import { requestNotificationPermission, onMessageListener, showNotification } from './firebase';
import { toast } from 'sonner';

export interface NotificationData {
  type: 'new_order' | 'order_update' | 'low_stock' | 'system';
  title: string;
  body: string;
  orderId?: string;
  productId?: string;
  data?: any;
}

class NotificationService {
  private isInitialized = false;
  private fcmToken: string | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permission and get FCM token
      this.fcmToken = await requestNotificationPermission();
      
      if (this.fcmToken) {
        console.log('Notification service initialized with token:', this.fcmToken);
        
        // Listen for foreground messages
        this.setupForegroundListener();
        
        // Listen for messages from service worker
        this.setupServiceWorkerListener();
        
        this.isInitialized = true;
        
        // Show success toast
        toast.success('🔔 Notifications enabled! You\'ll receive alerts for new orders.');
      } else {
        console.warn('Failed to get FCM token');
        toast.warning('Notifications not enabled. You may miss important alerts.');
      }
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      toast.error('Failed to enable notifications');
    }
  }

  private setupForegroundListener() {
    onMessageListener().then((payload: any) => {
      console.log('Foreground message received:', payload);
      
      const notification = payload.notification;
      const data = payload.data;
      
      if (notification) {
        // Show browser notification
        showNotification(
          notification.title,
          notification.body,
          notification.icon,
          data
        );
        
        // Show toast notification as well
        this.showToastNotification({
          type: data?.type || 'system',
          title: notification.title,
          body: notification.body,
          orderId: data?.orderId,
          data: data
        });
        
        // Play notification sound
        this.playNotificationSound();
        
        // Update notification badge/counter if needed
        this.updateNotificationBadge();
      }
    }).catch((error) => {
      console.error('Error setting up foreground listener:', error);
    });
  }

  private setupServiceWorkerListener() {
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from service worker:', event.data);
      
      if (event.data.type === 'NAVIGATE_TO_ORDER') {
        // Handle navigation from service worker
        const orderId = event.data.orderId;
        if (orderId) {
          window.location.href = `/orders?highlight=${orderId}`;
        } else {
          window.location.href = '/orders';
        }
      }
    });
  }

  private showToastNotification(notification: NotificationData) {
    const { type, title, body, orderId } = notification;

    switch (type) {
      case 'new_order':
        toast.success(`${title}: ${body}`, {
          duration: 10000,
          position: 'top-right',
          action: orderId ? {
            label: 'View Order →',
            onClick: () => window.location.href = `/orders?highlight=${orderId}`
          } : undefined
        });
        break;

      case 'low_stock':
        toast.warning(`${title}: ${body}`, {
          duration: 8000,
          position: 'top-right',
          action: {
            label: 'Check Inventory →',
            onClick: () => window.location.href = '/inventory'
          }
        });
        break;

      case 'order_update':
        toast.info(`${title}: ${body}`, {
          duration: 5000,
          position: 'top-right'
        });
        break;

      default:
        toast(`${title}: ${body}`, {
          duration: 5000,
          position: 'top-right'
        });
    }
  }

  private playNotificationSound() {
    try {
      // Create audio element for notification sound
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.log('Notification sound not available:', error);
    }
  }

  private updateNotificationBadge() {
    // Update favicon or page title to show notification
    const originalTitle = document.title;
    document.title = '🔔 ' + originalTitle;
    
    // Reset title after 5 seconds
    setTimeout(() => {
      document.title = originalTitle;
    }, 5000);
  }

  // Method to manually send test notification
  async sendTestNotification() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    showNotification(
      '🧪 Test Notification',
      'This is a test notification to verify the system is working!',
      '/favicon.ico',
      { type: 'test' }
    );
    
    toast.success('Test notification sent!');
  }

  // Get current FCM token
  getToken() {
    return this.fcmToken;
  }

  // Check if notifications are enabled
  isEnabled() {
    return this.isInitialized && this.fcmToken !== null;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

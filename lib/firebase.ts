import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCIvHICPVf_cnZLfYIVFL-t3uIvn0cMfZM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ghanshyammurtibhandar-f5ced.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ghanshyammurtibhandar-f5ced",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ghanshyammurtibhandar-f5ced.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "441326426415",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:441326426415:web:84541d396d2199fd09e9da",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-VW95MDZD8K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;

// Check if messaging is supported (only in browser environment)
const initializeMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported && typeof window !== 'undefined') {
      messaging = getMessaging(app);
      return messaging;
    }
    return null;
  } catch (error) {
    console.error('Firebase messaging not supported:', error);
    return null;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      messaging = await initializeMessaging();
    }
    
    if (!messaging) {
      throw new Error('Messaging not supported');
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Get registration token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'BCMBsRG_u39Xc9yTbv0DxVrcW9hQ2iQ_uu5_uys74QRc50v3co-fvrOJou3KJkVPyRLY5NGEhQMnYdsqp1WF_JE'
      });
      
      if (token) {
        console.log('FCM Token:', token);
        // Send token to backend to store for this admin user
        await saveTokenToBackend(token);
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Save FCM token to backend
const saveTokenToBackend = async (token: string) => {
  try {
    const response = await fetch('/api/admin/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ fcmToken: token })
    });
    
    if (response.ok) {
      console.log('FCM token saved to backend');
    } else {
      console.error('Failed to save FCM token to backend');
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) {
      initializeMessaging().then((msg) => {
        if (msg) {
          onMessage(msg, (payload) => {
            console.log('Message received in foreground:', payload);
            resolve(payload);
          });
        }
      });
    } else {
      onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        resolve(payload);
      });
    }
  });
};

// Show notification manually (for foreground messages)
export const showNotification = (title: string, body: string, icon?: string, data?: any) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'order-notification',
      requireInteraction: true,
      data
    });

    notification.onclick = () => {
      window.focus();
      if (data?.orderId) {
        // Navigate to order details
        window.location.href = `/orders?highlight=${data.orderId}`;
      }
      notification.close();
    };

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  }
};

export { messaging };

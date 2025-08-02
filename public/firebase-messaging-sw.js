// Firebase service worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIvHICPVf_cnZLfYIVFL-t3uIvn0cMfZM",
  authDomain: "ghanshyammurtibhandar-f5ced.firebaseapp.com",
  projectId: "ghanshyammurtibhandar-f5ced",
  storageBucket: "ghanshyammurtibhandar-f5ced.firebasestorage.app",
  messagingSenderId: "441326426415",
  appId: "1:441326426415:web:84541d396d2199fd09e9da",
  measurementId: "G-VW95MDZD8K"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Order Received!';
  const notificationOptions = {
    body: payload.notification?.body || 'A new order has been placed.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'order-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Order',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png'
      }
    ],
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'view') {
    // Open the admin panel and navigate to orders
    const orderId = event.notification.data?.orderId;
    const url = orderId ? `/orders?highlight=${orderId}` : '/orders';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if admin panel is already open
        for (const client of clientList) {
          if (client.url.includes('admin') && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NAVIGATE_TO_ORDER',
              orderId: orderId
            });
            return;
          }
        }
        
        // Open new window if not already open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Handle push events (for additional customization)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    console.log('Push data:', data);
    
    // Custom handling for different notification types
    if (data.type === 'new_order') {
      const notificationTitle = '🛒 New Order Alert!';
      const notificationOptions = {
        body: `Order #${data.orderNumber} - ₹${data.amount}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'new-order',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: data
      };
      
      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    }
  }
});

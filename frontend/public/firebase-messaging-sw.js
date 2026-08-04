// Firebase Cloud Messaging Service Worker
// This file MUST live at the root (public/) and is separate from the Workbox SW.
// Firebase requires this exact filename: firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// These values are injected at build time via a template replacement strategy,
// but since SW cannot import .env, we use self.__FIREBASE_CONFIG set by the page.
// The page writes window.__FIREBASE_CONFIG = { ... } before registering the SW.
// As a fallback, hard-coded placeholders are overridden when the app registers the SW.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    const config = event.data.config;

    firebase.initializeApp(config);
    const messaging = firebase.messaging();

    // Handle background messages (app is closed or in background)
    messaging.onBackgroundMessage((payload) => {
      const { notification, data } = payload;

      const notificationTitle = notification?.title || 'Brokie';
      const notificationOptions = {
        body: notification?.body || "Time to check your wallet.",
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: data?.tag || 'brokie-reminder',
        data: data || {},
        vibrate: [200, 100, 200],
        actions: [
          { action: 'open', title: 'Open Brokie' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

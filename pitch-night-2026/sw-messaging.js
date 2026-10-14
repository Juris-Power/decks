/**
 * Service Worker — Messaging Push Notifications
 *
 * Handles push events from the backend and displays browser notifications.
 * Also handles notification click to navigate to the right conversation.
 */

/* eslint-disable no-restricted-globals */

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    // Not JSON — ignore
    return;
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/images/pwa-icon-192.png',
    badge: data.badge || '/images/pwa-icon-192.png',
    tag: data.tag || 'messaging',
    renotify: true,
    data: data.data || {},
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'dismiss', title: 'Fermer' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Nouveau message', options),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const actionUrl = event.notification.data?.actionUrl || '/app/messages';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus an existing window
        for (const client of clientList) {
          if (client.url.includes('/app') && 'focus' in client) {
            client.focus();
            client.navigate(actionUrl);
            return;
          }
        }
        // Open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(actionUrl);
        }
      }),
  );
});

self.addEventListener('notificationclose', () => {
  // Analytics: track notification dismissals if needed
});

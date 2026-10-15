// WHATS POPPIN service worker: shows push notifications and opens the right page on tap.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'WHATS POPPIN', body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'WHATS POPPIN', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      lang: 'he',
      dir: 'rtl',
      tag: data.tag,
      data: { url: data.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((w) => w.url === url);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    }),
  );
});

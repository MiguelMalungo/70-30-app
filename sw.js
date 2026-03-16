const CACHE_NAME = '7030-v1';
const PRECACHE = [
  '/70-30-app/',
  '/70-30-app/index.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ─── Push Notifications ─── */
self.addEventListener('push', (e) => {
  let data = { title: '70.30', body: 'Tens uma nova notificação.', icon: '/70-30-app/pwa-192.png' };
  try {
    if (e.data) data = { ...data, ...e.data.json() };
  } catch { /* use defaults */ }

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: '/70-30-app/pwa-192.png',
      data: data.url || '/',
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});

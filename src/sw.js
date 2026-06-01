const CACHE_NAME = 'cc-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache same-origin assets first (these always work)
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('SW: same-origin cache addAll failed', err);
      });
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;
  // Skip chrome-extension and other non-http(s) schemes
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) return res;
      // Fetch from network and cache successful responses
      return fetch(e.request).then((networkRes) => {
        // Only cache same-origin or CORS-enabled responses
        if (networkRes.ok && (e.request.url.startsWith(self.location.origin) || networkRes.type === 'cors')) {
          var clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return networkRes;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
});

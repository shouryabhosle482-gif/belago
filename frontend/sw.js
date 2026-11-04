const CACHE_NAME = 'belago-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/explore',
  '/sell',
  '/login',
  '/register',
  '/dashboard',
  '/css/style.css',
  '/js/app.js',
  '/js/explore.js',
  '/js/auth.js',
  '/js/sell.js',
  '/js/listing.js',
  '/js/dashboard.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('/index.html')))
  );
});

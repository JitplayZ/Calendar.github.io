// Cache version name in quotes (string format)
const CACHE_NAME = 'calendar-app-cache-v7';

// Add all important resources that should work offline
const urlsToCache = [
  './',            // Root directory
  './index.html',  // Main HTML
  './styles.css',  // Styles
  './script.js',   // Main JavaScript
  './logo.png',    // Logo
  // Add any other important files here
];

// Installation - Cache all resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing new version');
  
  self.skipWaiting();
  
  event.waitUntil(
    caches.open('calendar-app-cache-v7')
      .then((cache) => {
        console.log('[Service Worker] Caching resources');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Cache failed:', error);
      })
  );
});

// Activation - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating new version');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== 'calendar-app-cache-v6') {
              console.log('[Service Worker] Deleting old cache:', name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Enhanced fetch handler with cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // If resource is in cache, return it
          return cachedResponse;
        }

        // If not in cache, try network
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add new resource to cache
            caches.open('calendar-app-cache-v7')
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});
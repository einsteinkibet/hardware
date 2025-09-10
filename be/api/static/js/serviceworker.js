// static/js/serviceworker.js
const CACHE_NAME = 'hardwarehub-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/app.js',
  // Add other important assets
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
const CACHE_NAME = 'mapbox-tile-cache-v2';

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('mapbox.com') && event.request.method === 'GET') {
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.match(event.request).then((response) => {
            return response || fetch(event.request).then((response) => {
              cache.put(event.request, response.clone());
              return response;
            });
          });
        })
    );
  }
});
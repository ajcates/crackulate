self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('calcedit-cache').then(cache => {
      return cache.addAll([
        '/',
        'https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(networkResponse => {
        return caches.open('calcedit-cache').then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
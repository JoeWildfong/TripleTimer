STATIC_CACHE_NAME = "static-1.0";

STATIC_CACHE_FILES = [
  "/",
  "/index.html",
  "/triple-timer.css",
  "/triple-timer.js",
  "/easytimer.min.js",
  "/sw-control.js",
];

self.addEventListener('install', event => {
    // self.skipWaiting();
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(
            cache => cache.addAll(STATIC_CACHE_FILES)
        )
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(
            keyList => Promise.all(keyList.map((key) => {
                if (key !== STATIC_CACHE_NAME) {
                    return caches.delete(key);
                }
            }))
        )
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // caches.match() always resolves
            // but in case of failure response will be undefined
            if (response !== undefined) {
                return response;
            }
            return fetch(event.request).then(response => {
                // response may be used only once
                // we need to save a clone to put one copy in cache
                // and serve the second one
                let responseClone = response.clone();
                caches.open(STATIC_CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            });
        })
    );
});
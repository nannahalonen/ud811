var cacheName = "weatherPWA-v5";
var dataCacheName = "weatherPWA-data"
var filesToCache = [
    '/',
    './index.html',
    './scripts/app.js',
    './scripts/config.js',
    './styles/ud811.css',
    './scripts/localforage.min.js',
    './images/ic_add_white_24px.svg',
    './images/ic_refresh_white_24px.svg',
];

var weatherAPIUrlBase = 'http://api.apixu.com/v1/forecast.json';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {

  self.clients.claim();
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.startsWith(weatherAPIUrlBase)) {
    e.respondWith(
        fetch(e.request)
        .then(function(response) {
          return caches.open(dataCacheName).then(function(cache) {
            cache.put(e.request.url, response.clone());
            return response;
          });
        })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
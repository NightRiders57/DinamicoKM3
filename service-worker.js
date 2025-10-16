const CACHE_NAME = "night-riders-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/percorso.gpx",
  "https://unpkg.com/leaflet/dist/leaflet.css",
  "https://unpkg.com/leaflet/dist/leaflet.js",
  "https://unpkg.com/leaflet-gpx/gpx.js"
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
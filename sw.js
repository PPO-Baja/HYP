// Simple service worker for offline shell
const CACHE = "pwa-forms-v1";
const OFFLINE_URL = "/offline.html";

const ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.webmanifest",
  "/assets/icon-192.png",
  "/assets/icon-512.png"
 
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

// Network-first for everything, with offline fallback to offline.html for navigations
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // For navigation requests, try network first then fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // For other requests, try cache first then network
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});

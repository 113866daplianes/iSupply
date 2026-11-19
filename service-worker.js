// DES iSupply — isolated PWA worker.
// This worker may only cache URLs inside /iSupply/ and only manages its own cache namespace.
const CACHE_NAME = "isupply-shell-v3";
const CACHE_PREFIX = "isupply-";
const APP_SCOPE = new URL(self.registration.scope);
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./app-config.js",
  "./manifest.webmanifest",
  "./assets/isupply-logo.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/apple-touch-icon.png",
  "./assets/favicon-32.png"
].map(path => new URL(path, APP_SCOPE).href);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Do not intercept Apps Script, Google, or other apps on the shared GitHub Pages origin.
  if (url.origin !== APP_SCOPE.origin || !url.pathname.startsWith(APP_SCOPE.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response && response.ok) await cache.put(request, response.clone());
      return response;
    } catch (_) {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") {
        return (await cache.match(new URL("index.html", APP_SCOPE).href)) || Response.error();
      }
      return Response.error();
    }
  })());
});

/* Tea-Ta Kopi offline shell. A cart remains local; sending still requires Messenger online. */
const CACHE = "teata-v3";
const SHELL = [
  "index.html",
  "menu.html",
  "about.html",
  "contact.html",
  "order.html",
  "css/tokens.css",
  "css/style.css",
  "css/pages.css",
  "js/main.js",
  "js/menu-data.js",
  "js/menu.js",
  "js/cart.js",
  "js/order.js",
  "manifest.webmanifest",
  "assets/logo-lineart.png",
  "assets/menu-board.jpg",
  "assets/storefront-dusk.png",
  "assets/storefront-night.jpg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "fonts/sora-400.woff2",
  "fonts/sora-500.woff2",
  "fonts/sora-700.woff2",
  "fonts/space-mono-400.woff2",
  "fonts/space-mono-700.woff2"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key !== CACHE; }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* HTML prefers a fresh copy when online; the cache keeps the app usable offline. */
  if (request.destination === "document") {
    event.respondWith(fetch(request).then(function (response) {
      var copy = response.clone();
      caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
      return response;
    }).catch(function () { return caches.match(request).then(function (hit) { return hit || caches.match("index.html"); }); }));
    return;
  }

  event.respondWith(caches.match(request).then(function (hit) {
    if (hit) return hit;
    return fetch(request).then(function (response) {
      if (response && response.ok) {
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
      }
      return response;
    });
  }));
});

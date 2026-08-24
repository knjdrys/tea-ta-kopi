/* Tea-Ta Kopi - offline shell (cache-first for app assets, network-first for maps) */
const CACHE = "teata-v1";
const SHELL = [
  "index.html",
  "menu.html",
  "about.html",
  "contact.html",
  "css/tokens.css",
  "css/style.css",
  "css/pages.css",
  "js/main.js",
  "js/cart.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "fonts/sora-400.woff2",
  "fonts/sora-500.woff2",
  "fonts/sora-700.woff2",
  "fonts/space-mono-400.woff2",
  "fonts/space-mono-700.woff2"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  // Maps / external: network-first, fall back to cache
  if (/google|gstatic|facebook/.test(req.url)) {
    e.respondWith(fetch(req).catch(function () { return caches.match(req); }));
    return;
  }

  // App assets: cache-first, then network (and cache the new response)
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return caches.match("index.html"); });
    })
  );
});

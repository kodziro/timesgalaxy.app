// Service worker for the web beta: after the first visit the game runs offline.
// It lives at the site root, so its scope is the whole site, both at the custom domain and at
// github.io/<repo>/. All paths are relative to this file. No push notifications.
// Pages: network first (a new deploy shows at once), cached copy when offline.
// Fonts, icons, manifest: cached copy first, refreshed in the background.
// Requests to other sites (TelemetryDeck's server) are never touched or cached.
var CACHE = "times-galaxy-v2";
var CORE = [
  "./play/",
  "./manifest.webmanifest",
  "./fonts/lilita-one-latin.woff2", "./fonts/lilita-one-latin-ext.woff2",
  "./fonts/nunito-latin.woff2", "./fonts/nunito-latin-ext.woff2",
  "./vendor/telemetrydeck/telemetrydeck.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./icons/favicon-32.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (req.mode === "navigate" || /\.html$|\/$/.test(url.pathname)) {
    e.respondWith(fetch(req).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(url.origin + url.pathname, copy); }); }
      return res;
    }).catch(function () {
      // offline: the page without its query (?test=1), or /play/ for /play/index.html
      return caches.match(url.origin + url.pathname).then(function (hit) {
        return hit || caches.match(url.origin + url.pathname.replace(/index\.html$/, ""));
      }).then(function (hit) { return hit || Response.error(); });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    });
    if (hit) { net.catch(function () {}); return hit; }
    return net;
  }));
});

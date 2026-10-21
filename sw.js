/* Service worker LMS — cache shell untuk mode terpasang / daring. */
var CACHE = "lms-v1";
var ASSETS = [
  "index.html",
  "assets/portal.css",
  "assets/portal.js",
  "assets/icons.js",
  "assets/logo-sma4.png",
  "data/registry.js",
  "manifest.webmanifest"
];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
  self.skipWaiting();
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        return res;
      }).catch(function(){ return caches.match("index.html"); });
    })
  );
});

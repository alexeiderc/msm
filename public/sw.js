const MSM_CACHE = "msm-my-store-v1";
const MSM_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icons/msm-icon.svg",
  "/brand/msm-my-store-logo.jpeg",
  "/brand/msm-global-watermark.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(MSM_CACHE).then((cache) => cache.addAll(MSM_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== MSM_CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        if (response.ok && request.url.startsWith(self.location.origin)) {
          caches.open(MSM_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
        }
        return response;
      });
    })
  );
});

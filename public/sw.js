// Bump this on any change to caching behavior. The `activate` handler deletes
// every cache whose name !== CACHE_NAME, so bumping it purges stale caches
// (e.g. the old cache-first copies of the /static landing page that caused
// garbled first-loads until a hard refresh).
const CACHE_NAME = 'element-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['/']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests and Firebase/Google API calls
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('googletagmanager.com')
  ) return;

  // Only same-origin requests are cacheable here; let cross-origin embeds
  // (YouTube, Instagram, etc.) pass straight through to the network.
  if (url.origin !== self.location.origin) return;

  // Vite emits content-hashed, immutable bundles under /assets/. A new deploy
  // produces new filenames, so these are safe (and ideal) to serve cache-first.
  const isImmutableAsset = url.pathname.startsWith('/assets/');

  if (isImmutableAsset) {
    // Cache-first: hashed filenames can never go stale.
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Everything else same-origin (the SPA shell, the /static landing page and
  // its non-hashed HTML/CSS/JS, manifest.json) is network-first: always fresh
  // when online, with the cached copy as an offline fallback. This is what keeps
  // the static site from serving stale content after a deploy.
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache complete, OK, basic (same-origin) responses. Skip opaque
        // and partial (206) responses, which can't be reliably replayed.
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

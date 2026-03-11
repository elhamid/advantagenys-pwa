// Advantage Services PWA — Service Worker
// Cache-first for static assets, network-first for pages, offline fallback

const CACHE_NAME = "advantage-v1";
const OFFLINE_URL = "/offline.html";

// App shell assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

// ── Install: precache the app shell ──────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategy ───────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Next.js internal routes (_next/data, API routes)
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/api/")) {
    return;
  }

  // Static assets (images, fonts, icons, JS/CSS chunks): cache-first
  if (
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|woff2?|ttf|otf)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation requests (HTML pages): network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Everything else: network-first
  event.respondWith(networkFirst(request));
});

// ── Strategy: cache-first ─────────────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

// ── Strategy: network-first ───────────────────────────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response("", { status: 503 });
  }
}

// ── Strategy: network-first with offline HTML fallback ───────────────────────
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Serve offline page for navigation failures
    const offlinePage = await caches.match(OFFLINE_URL);
    return (
      offlinePage ||
      new Response("<h1>You are offline</h1>", {
        headers: { "Content-Type": "text/html" },
        status: 503,
      })
    );
  }
}

/**
 * Offline support and asset caching.
 *
 * The previous version was cache-first for every GET with no revalidation, so once a
 * page was cached a returning visitor kept seeing it forever — a deploy never reached
 * them. Now HTML is network-first (content stays fresh, cache is only the offline
 * fallback) and only content-hashed assets are cache-first.
 *
 * Bump CACHE_NAME whenever the caching strategy changes; `activate` purges every
 * older cache.
 */
const CACHE_NAME = 'prettyformat-v3';

/** Enough to render something useful when offline. */
const PRECACHE_URLS = [
    '/',
    '/manifest.json',
    '/favicon.svg',
    '/apple-touch-icon.svg',
    '/locales/en/translation.json',
    '/locales/pt/translation.json',
    '/locales/de/translation.json',
    '/locales/fr/translation.json',
    '/locales/es/translation.json',
    '/locales/zh/translation.json',
    '/locales/ja/translation.json',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            // Individual failures must not abort the install.
            .then((cache) => Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
            // Take over open tabs immediately, so the stale-HTML fix applies on this visit.
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return; // AdSense, gtag, fonts: never touched

    // HTML: always try the network first so a deploy is visible immediately.
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }

    // Build assets carry a content hash in the filename, so they are safe forever.
    if (url.pathname.startsWith('/assets/')) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Translations and icons: serve instantly, refresh in the background.
    if (url.pathname.startsWith('/locales/') || url.pathname.endsWith('.svg')) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }
});

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response && response.ok && response.type === 'basic') {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        // Fall back to the cached homepage so offline navigation shows something.
        return cached || (await caches.match('/')) || Response.error();
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response && response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
    }
    return response;
}

async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);
    const network = fetch(request)
        .then(async (response) => {
            if (response && response.ok && response.type === 'basic') {
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => undefined);

    return cached || (await network) || Response.error();
}

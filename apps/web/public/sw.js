/**
 * Service Worker for iWARDROBE
 * Handles caching, offline support, and performance optimizations
 */

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  STATIC: `iwardrobe-static-${CACHE_VERSION}`,
  DYNAMIC: `iwardrobe-dynamic-${CACHE_VERSION}`,
  MEDIAPIPE: `iwardrobe-mediapipe-${CACHE_VERSION}`,
};

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event: ExtendedInstallEvent) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAMES.STATIC);
        await cache.addAll(STATIC_ASSETS.filter(url => url !== '/offline.html'));
        console.log('[SW] Static assets cached');
        // Immediately claim clients
        await self.skipWaiting();
      } catch (error) {
        console.warn('[SW] Install error:', error);
      }
    })()
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event: ExtendedActivateEvent) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
          .filter(name => !Object.values(CACHE_NAMES).includes(name))
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          });
        
        await Promise.all(deletePromises);
        await self.clients.claim();
        console.log('[SW] Activation complete');
      } catch (error) {
        console.warn('[SW] Activation error:', error);
      }
    })()
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Determine caching strategy based on request type
  if (request.method !== 'GET') {
    return; // Don't cache non-GET requests
  }

  // Strategy for MediaPipe assets (cache-first)
  if (url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'storage.googleapis.com') {
    event.respondWith(cacheMediaPipeAsset(request));
    return;
  }

  // Strategy for API calls (network-first)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Strategy for static assets (cache-first)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default strategy for documents (network-first)
  event.respondWith(networkFirst(request));
});

/**
 * Cache-first strategy: use cache if available, fallback to network
 */
async function cacheFirst(request: Request): Promise<Response> {
  try {
    const cache = await caches.open(CACHE_NAMES.STATIC);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Cache-first strategy error:', error);
    // Return offline fallback or error response
    return new Response('Offline - Resource not available', { status: 503 });
  }
}

/**
 * Network-first strategy: try network, fallback to cache
 */
async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAMES.DYNAMIC);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn('[SW] Network request failed, using cache:', error);

    // Try to get from cache
    const cache = await caches.open(CACHE_NAMES.DYNAMIC);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // Return offline response
    return new Response('Offline - Please check your connection', { status: 503 });
  }
}

/**
 * Cache MediaPipe assets aggressively
 */
async function cacheMediaPipeAsset(request: Request): Promise<Response> {
  try {
    const cache = await caches.open(CACHE_NAMES.MEDIAPIPE);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] MediaPipe caching error:', error);
    return new Response('Failed to load MediaPipe asset', { status: 503 });
  }
}

/**
 * Message handler for cache management
 */
self.addEventListener('message', (event: ExtendedMessageEvent) => {
  const { type } = event.data;

  switch (type) {
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;

    case 'CLEAR_DYNAMIC_CACHE':
      caches.delete(CACHE_NAMES.DYNAMIC);
      break;

    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ cacheSize: size });
      });
      break;

    default:
      console.warn('[SW] Unknown message type:', type);
  }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    const deletePromises = cacheNames
      .filter(name => Object.values(CACHE_NAMES).includes(name))
      .map(name => caches.delete(name));

    await Promise.all(deletePromises);
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Error clearing caches:', error);
  }
}

/**
 * Get total cache size
 */
async function getCacheSize(): Promise<number> {
  if (!('estimate' in navigator.storage)) {
    return 0;
  }

  try {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  } catch (error) {
    console.error('[SW] Error getting cache size:', error);
    return 0;
  }
}

// TypeScript declarations for extended event types
interface ExtendedInstallEvent extends InstallEvent {
  waitUntil(promise: Promise<void>): void;
}

interface ExtendedActivateEvent extends ActivateEvent {
  waitUntil(promise: Promise<void>): void;
}

interface ExtendedMessageEvent extends ExtendedMessageEventInit {
  ports: MessagePort[];
  data: {
    type: string;
    [key: string]: unknown;
  };
}

interface ExtendedMessageEventInit extends EventInit {
  data?: unknown;
  origin?: string;
  source?: Client | MessagePort | ServiceWorker | null;
}

export {};

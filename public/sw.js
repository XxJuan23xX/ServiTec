// ============================================================
// Service Worker - ServiTec PWA
// Estrategia: Stale-While-Revalidate + Cache First para assets
// ============================================================

const CACHE_NAME = 'servitec-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ── INSTALL: Pre-cachear assets estáticos ──────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-cacheando assets estáticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activar inmediatamente sin esperar a que se cierre la pestaña anterior
  self.skipWaiting();
});

// ── ACTIVATE: Limpiar caches viejos ────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Eliminando cache viejo:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Tomar control de las páginas abiertas inmediatamente
  self.clients.claim();
});

// ── FETCH: Stale-While-Revalidate ──────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo cachear requests GET
  if (request.method !== 'GET') return;

  // Ignorar peticiones que no sean http/https (ej. chrome-extension://)
  if (!request.url.startsWith('http')) return;

  // No cachear requests a la API del backend
  if (request.url.includes('/api/')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);

      // Lanzar fetch en background para actualizar cache (revalidate)
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // Solo cachear respuestas válidas
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(async () => {
          // Si no hay red y es navegación SPA, servir index.html
          if (request.mode === 'navigate') {
            const fallback = await cache.match('/index.html') || await cache.match('/');
            if (fallback) return fallback;
          }
          return cachedResponse;
        });

      // Devolver cached version inmediatamente (stale), actualizar en background (revalidate)
      return cachedResponse || fetchPromise;
    })
  );
});

// ── SYNC: Background Sync para reportes pendientes ─────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reportes') {
    console.log('[SW] Sincronizando reportes pendientes...');
    event.waitUntil(syncPendingReportes());
  }
});

async function syncPendingReportes() {
  // Esta función será invocada cuando se recupere la conexión
  // Los reportes pendientes se leen desde el cliente vía message
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_REPORTES' });
  });
}

// ── MESSAGE: Comunicación con la app ───────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

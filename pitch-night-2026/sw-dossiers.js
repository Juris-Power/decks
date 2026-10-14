/**
 * sw-dossiers.js — Service Worker offline LECTURE dossiers (chantier
 * launch-quality-prelaunch, Phase 5).
 *
 * Service worker isolé scope /app/ (enregistré PROD-only depuis DossiersPage
 * via useDossiersOfflineSW). Stratégie — calquée sur sw-tasks.js (le seul
 * pattern offline éprouvé du repo) :
 *
 * - **Stale-while-revalidate** sur GET `/back/lawyer/cases*` : retour cache
 *   immédiat + fetch background pour rafraîchir. Permet à un avocat de
 *   **relire ses dossiers déjà consultés hors connexion** (audience, train).
 * - **Passthrough** sur tout le reste (assets Vite hashés — anti cache
 *   poisoning, incident sw.js kill-switch) + toute mutation (V1 = lecture seule).
 *
 * Doctrine (identique sw-tasks.js) :
 * - Pas de pre-cache assets (incident sw.js principal kill-switch).
 * - skipWaiting + clients.claim immédiat.
 * - PAS de cache des réponses non-OK / authentifiées en erreur (401/403/5xx → laisser passer).
 *
 * ROBUSTESSE : le kill-switch global `sw.js` (qui purgeait TOUS les caches à
 * chaque boot prod) a été RETIRÉ le 2026-06-18 (register-sw.ts, MCP
 * Decision_StaleKillSwitchRetirableBlocksOffline). Donc ce cache **survit
 * cross-session** une fois le retrait déployé. (Avant retrait : purgé à chaque
 * reload = intra-session seulement.)
 */

const SW_VERSION = "v1-dossiers-read-2026-06-18";
const CACHE_NAME = `dossiers-cache-${SW_VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await caches.open(CACHE_NAME); // vide au démarrage — SWR rempli au fil de l'eau
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Cleanup des anciennes versions de CE cache uniquement (jamais les caches d'autrui)
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("dossiers-cache-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// Endpoints lecture dossiers : GET /back/lawyer/cases, /back/lawyer/cases/:id,
// /back/lawyer/cases/:id/activities. EXCLURE les mutations (gérées online only en V1).
function isDossiersReadApi(url) {
  return /^\/back\/lawyer\/cases(\/|\?|$)/.test(url.pathname);
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      // Ne cache QUE les réponses OK (pas 401/403/5xx — data périmée/autre user)
      if (response.ok && response.status < 400) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch((err) => {
      // Réseau down → retombe sur le cache si dispo
      if (cached) return cached;
      throw err;
    });
  return cached || fetchPromise;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // V1 = lecture seule : on n'intercepte QUE les GET/HEAD dossiers. Tout le reste passthrough.
  if (req.method !== "GET" && req.method !== "HEAD") return;
  let url;
  try {
    url = new URL(req.url);
  } catch (_e) {
    return;
  }
  if (isDossiersReadApi(url)) {
    event.respondWith(staleWhileRevalidate(req));
  }
  // Autres GET (assets Vite, autres API) → passthrough natif (rien à faire).
});

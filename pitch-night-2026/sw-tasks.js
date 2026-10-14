/**
 * sw-tasks.js — V13.2 PWA sub-app Service Worker (chantier
 * taches-intelligence-metier).
 *
 * Service worker isolé scope /app/m/taches. Stratégie :
 *
 * - **Stale-while-revalidate** sur GET `/back/tasks*` : retour cache
 *   immédiat + fetch background pour rafraîchir. Permet lecture liste
 *   tâches hors-ligne.
 * - **IndexedDB outbox** sur POST/PATCH/DELETE `/back/tasks*` quand offline :
 *   met la mutation en queue puis tente flush au prochain `sync`.
 * - **Passthrough** sur tout le reste (assets Vite hashes — anti cache
 *   poisoning incident SW principal).
 *
 * V13.2 décision : last-write-wins via timestamp côté client (`requestedAt`).
 * Le backend reste source de vérité au retour online.
 *
 * Doctrine :
 * - Pas de pre-cache assets (incident `sw.js` principal kill-switch)
 * - skipWaiting + clients.claim immédiat (1er déploiement SW propre)
 * - PAS de cache des réponses authentifiées en cas d'erreur (401 → laisser
 *   passer)
 */

const SW_VERSION = "v13.2-outbox-2026-05-25";
const CACHE_NAME = `tasks-cache-${SW_VERSION}`;
const DB_NAME = "tasks-outbox";
const DB_STORE = "outbox";
const DB_VERSION = 1;
const OUTBOX_SYNC_TAG = "tasks-outbox-sync";

// ============================================================================
// IndexedDB outbox helpers
// ============================================================================

function openOutboxDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        const store = db.createObjectStore(DB_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("by-requestedAt", "requestedAt", { unique: false });
      }
    };
  });
}

async function enqueueOutbox(entry) {
  const db = await openOutboxDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    const store = tx.objectStore(DB_STORE);
    const req = store.add(entry);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function listOutbox() {
  const db = await openOutboxDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const store = tx.objectStore(DB_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function deleteOutboxEntry(id) {
  const db = await openOutboxDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    const store = tx.objectStore(DB_STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ============================================================================
// Lifecycle
// ============================================================================

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      // Ouvre cache nommé (vide au démarrage — SWR rempli au fil de l'eau)
      await caches.open(CACHE_NAME);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Cleanup anciens caches versionnés
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("tasks-cache-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// ============================================================================
// Fetch — strategie hybride
// ============================================================================

function isTasksApi(url) {
  // V13.2 P0.5 fix : restreindre aux endpoints CRUD tâches uniquement.
  // EXCLURE /back/tasks/:id/assignments (RACI invite) qui serait
  // accidentellement queue → 202 synthétique → UI mensongère "invite OK".
  // EXCLURE /back/task-assignments/* (respond/revoke/pending/workload).
  const p = url.pathname;
  if (p.startsWith("/back/task-assignments")) return false;
  if (/\/back\/tasks\/[^/]+\/assignments(\?|$)/.test(p)) return false;
  return p.startsWith("/back/tasks");
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      // Ne cache pas les 401/403/500 (data potentiellement périmée pour autre user)
      if (response.ok && response.status < 400) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch((err) => {
      // Réseau down → retombe sur cache si dispo
      if (cached) return cached;
      throw err;
    });
  return cached || fetchPromise;
}

async function handleMutationOffline(request) {
  // Cloner avant que le body soit consommé
  const cloned = request.clone();
  const body = await cloned.text();
  await enqueueOutbox({
    url: request.url,
    method: request.method,
    headers: Array.from(cloned.headers.entries()),
    body,
    requestedAt: Date.now(),
  });
  // Tente d'enregistrer un background sync pour flush
  if ("sync" in self.registration) {
    try {
      await self.registration.sync.register(OUTBOX_SYNC_TAG);
    } catch (_e) {
      // ignore — flush au prochain online via message client
    }
  }
  // Réponse synthétique 202 Accepted : le client UI peut afficher
  // "synchronisation en attente" sans crash.
  return new Response(
    JSON.stringify({
      _outboxQueued: true,
      message:
        "Mutation enregistrée hors-ligne — sera renvoyée au retour online.",
    }),
    {
      status: 202,
      headers: { "Content-Type": "application/json" },
    },
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method === "GET" || req.method === "HEAD") {
    let url;
    try {
      url = new URL(req.url);
    } catch (_e) {
      return;
    }
    if (isTasksApi(url)) {
      event.respondWith(staleWhileRevalidate(req));
    }
    // Autres GET (assets Vite) → passthrough natif (rien à faire)
    return;
  }
  // Mutations : POST/PATCH/PUT/DELETE
  if (["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) {
    let url;
    try {
      url = new URL(req.url);
    } catch (_e) {
      return;
    }
    if (!isTasksApi(url)) return;
    event.respondWith(
      fetch(req.clone()).catch(() => handleMutationOffline(req)),
    );
  }
});

// ============================================================================
// Flush outbox (sync API + manuel via message)
// ============================================================================

async function flushOutbox() {
  const entries = await listOutbox();
  // Tri par requestedAt ascendant → préserve l'ordre des mutations (last-write-wins)
  entries.sort((a, b) => a.requestedAt - b.requestedAt);
  for (const entry of entries) {
    try {
      const headers = new Headers(entry.headers);
      const res = await fetch(entry.url, {
        method: entry.method,
        headers,
        body: entry.body || undefined,
        credentials: "include",
      });
      if (res.ok) {
        await deleteOutboxEntry(entry.id);
      } else if (res.status === 409) {
        // 409 conflit accepté en last-write-wins : on drop + notify clients
        // pour metric observability (visibilité perte muette).
        await deleteOutboxEntry(entry.id);
        const clients = await self.clients.matchAll();
        clients.forEach((c) =>
          c.postMessage({
            type: "TASKS_OUTBOX_CONFLICT_DROPPED",
            url: entry.url,
            method: entry.method,
            requestedAt: entry.requestedAt,
          }),
        );
      } else if (res.status === 401 || res.status === 403) {
        // Auth perdue → on stoppe pour ne pas spammer, retry au prochain sync
        break;
      } else {
        // 4xx autre = mutation invalide, on drop pour pas boucler
        if (res.status >= 400 && res.status < 500) {
          await deleteOutboxEntry(entry.id);
        }
      }
    } catch (_err) {
      // Réseau toujours down → on s'arrête
      break;
    }
  }
}

self.addEventListener("sync", (event) => {
  if (event.tag === OUTBOX_SYNC_TAG) {
    event.waitUntil(flushOutbox());
  }
});

// ============================================================================
// Message handler (handshake + flush manuel)
// ============================================================================

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "TASKS_PWA_INIT") {
    event.source?.postMessage({
      type: "TASKS_PWA_INIT_ACK",
      version: SW_VERSION,
    });
    return;
  }

  // Trigger manuel du flush (depuis MobileTasksPage au retour online)
  if (data.type === "TASKS_OUTBOX_FLUSH") {
    event.waitUntil?.(flushOutbox());
  }
});

// ============================================================================
// Push notifications (V13.1 stub conservé)
// ============================================================================

self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || "Juris-Connect — Tâches", {
        body: data.body || "Vous avez une mise à jour.",
        icon: "/images/pwa-icon-192.png",
        badge: "/images/pwa-icon-192.png",
        tag: data.tag || "tasks-push",
        data: data.url || "/app/m/taches",
      }),
    );
  } catch (_e) {
    // ignore push malformés
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data || "/app/m/taches";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/app/m/taches") && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});

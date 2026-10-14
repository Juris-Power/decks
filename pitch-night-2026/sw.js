/**
 * Service Worker — KILL SWITCH
 *
 * Le SW precedent causait des reloads en boucle apres deploy :
 * - skipWaiting + clients.claim → SW_ACTIVATED → reload → new SW → boucle
 * - Cache poisoning des chunks JS hashes (HTML cache pointe vers chunks 404)
 *
 * Ce SW remplace l'ancien :
 * 1. S'auto-desinstalle a l'activation
 * 2. Vide TOUS les caches existants
 * 3. Force tous les onglets ouverts a recharger (avec le nouveau SW vide)
 *
 * Apres un cycle, le browser n'a plus de SW actif et sert tout via le reseau
 * standard. Pour reactiver un SW propre : reverter ce commit + ajouter une
 * strategie testee.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        // 1. Vider tous les caches
        if ('caches' in self) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }

        // 2. S'auto-desinstaller
        await self.registration.unregister();

        // 3. Recharger tous les onglets controles pour qu'ils repartent sans SW
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach((client) => {
          if ('navigate' in client) {
            try {
              client.navigate(client.url);
            } catch (_) {
              // ignore — le client peut etre deja en navigation
            }
          }
        });
      } catch (err) {
        // Best effort — meme en cas d'erreur, le SW se desinstalle
        console.warn('[SW kill-switch] cleanup error', err);
      }
    })(),
  );
});

// Aucun fetch handler — toutes les requetes passent par le reseau standard

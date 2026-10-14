/*
 * env.js — STUB DE DÉVELOPPEMENT (ne PAS remplir à la main).
 *
 * `index.html` charge `<script src="/env.js">` AVANT le bundle (levier 2 cascade,
 * 2026-07-13, commit e02a5b21d0) pour permettre une config injectée AU RUNTIME
 * via `window.__ENV` — une seule image front promue par fingerprint sur tous les
 * étages, sans rebuild par env.
 *
 * EN PRODUCTION / BETA / DEV déployés : ce fichier est ÉCRASÉ au boot du container
 * par `docker/frontend/entrypoint.sh`, qui écrit `window.__ENV = { VITE_… }` depuis
 * les variables d'environnement du container (servi en no-store par nginx).
 *
 * EN LOCAL (Vite, `docker/frontend/Dockerfile.dev`) : l'entrypoint nginx ne tourne
 * pas → sans ce fichier, Vite renvoie le fallback SPA (index.html en text/html) sur
 * `/env.js` → 404 + « Refused to execute script … MIME type is not executable » à
 * CHAQUE page. Ce stub sert un JS valide (200, application/javascript) et laisse
 * volontairement `window.__ENV` NON défini : `getRuntimeEnv()` retombe alors sur
 * `import.meta.env` (comportement build-time historique), et `isRuntimeEnvActive()`
 * reste `false` — sémantiquement correct, la config runtime n'est pas active en dev.
 *
 * Contrat : front/src/shared/utils/runtime-env.ts
 */

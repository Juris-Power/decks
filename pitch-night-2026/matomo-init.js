/**
 * Matomo Analytics Initialization
 *
 * Externalized from index.html to allow strict CSP (no unsafe-inline for scripts).
 * Only loads Matomo tracker in production environment.
 */
(function () {
  // Skip Matomo in dev/local environments
  var host = window.location.hostname;
  if (
    host === 'localhost' ||
    host.indexOf('127.0.0.1') !== -1 ||
    host.indexOf('.local') !== -1 ||
    host.indexOf('dev.juris-power.com') !== -1 ||
    host.indexOf('dev.juris-connect.fr') !== -1
  ) {
    window._paq = window._paq || [];
    return;
  }

  var _paq = (window._paq = window._paq || []);
  _paq.push(['disableCookies']);

  // Droit d'opposition (RGPD art. 21). La mesure d'audience repose sur
  // l'interet legitime, qui ouvre ce droit ; il doit donc couper le TOUT
  // PREMIER evenement, pas seulement les suivants. C'est pourquoi le choix
  // est relu ici, avant trackPageView, et non cote React qui monte plus tard.
  // Ecrit par matomoOptOut() (front/src/shared/utils/matomoProvider.ts) —
  // localStorage et non cookie, puisque disableCookies nous prive du cookie
  // d'opt-out natif de Matomo.
  try {
    if (window.localStorage.getItem('mediane.analytics.optOut') === '1') {
      _paq.push(['optUserOut']);
    }
  } catch (e) {
    // Navigation privee stricte : stockage refuse. On ne peut pas lire le
    // choix, on ne le suppose pas — le suivi reste actif, comme pour un
    // premier visiteur.
  }

  // Custom dimension #6 (action-scope) = sous-domaine actif
  // Permet de filtrer les events dans Matomo par mode app (client/avocat/admin/minisite).
  // Doit etre push AVANT trackPageView pour que la 1ere page soit dimension'ee.
  // Cf docs ADR-027 + front/src/shared/utils/matomoProvider.ts (MatomoDimension.AppEnv)
  var appMode = 'client';
  if (host.indexOf('avocat.') === 0) appMode = 'lawyer';
  else if (host.indexOf('admin.') === 0) appMode = 'admin';
  else if (host.indexOf('me-') === 0) appMode = 'minisite';
  _paq.push(['setCustomDimension', 6, appMode]);

  // Custom dimension #7 (action-scope) = type de page (auto via pathname)
  // Permet de segmenter par "univers de page" pour cross-app analyse :
  //   - public      : / / annuaire / mag / faq / about (pas d'auth, contenu public)
  //   - lawyer-app  : /app/* (espace avocat connecte)
  //   - admin-app   : /admin/* (espace admin connecte)
  //   - minisite    : sous-domaine me-{slug} (vitrine avocat publique)
  //   - auth        : /app/connexion, /app/inscription, /admin/login, etc.
  // Cf MatomoDimension.PageType.
  var path = window.location.pathname || '';
  var pageType = 'public';
  if (appMode === 'minisite') pageType = 'minisite';
  else if (
    path.indexOf('/connexion') !== -1 ||
    path.indexOf('/inscription') !== -1 ||
    path.indexOf('/login') !== -1 ||
    path.indexOf('/mot-de-passe') !== -1 ||
    path.indexOf('/activation') !== -1
  )
    pageType = 'auth';
  else if (path.indexOf('/admin') === 0 || appMode === 'admin') pageType = 'admin-app';
  else if (path.indexOf('/app') === 0 || appMode === 'lawyer') pageType = 'lawyer-app';
  _paq.push(['setCustomDimension', 7, pageType]);

  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);

  // HeartBeatTimer — ping Matomo toutes les 15s tant que la page est ouverte
  // pour avoir une mesure precise du "Average Time on Page" (sinon Matomo
  // calcule la duree comme delta entre 2 trackPageView, ce qui sous-estime
  // les pages "terminales" ou l'utilisateur ferme l'onglet directement).
  // Cf https://matomo.org/faq/how-to/faq_21824/
  _paq.push(['enableHeartBeatTimer', 15]);

  // Anti-adblock — utilise les paths nginx /a et /script.js (renames de
  // /matomo.php et /matomo.js) qui bypassent les filter lists d'uBlock,
  // Brave, AdGuard, etc. Cf docker/deployment/nginx/matomo.juris-power.com.conf.
  // Le nom du jour depuis le 2026-10-09 (« il faut installer matomo sous le
  // nouveau nom », William) : le bloc matomo de la conf du front de prod sert
  // les deux noms dans le même train que cette ligne, et Matomo connaît le
  // nouveau (action hotes-de-confiance de deploy.matomo.yml). L'ancien nom
  // reste servi ; la politique de sécurité autorise les deux.
  var u = '//matomo.juris-connect.fr/';
  _paq.push(['setTrackerUrl', u + 'a']);
  _paq.push(['setSiteId', '1']);

  var d = document;
  var g = d.createElement('script');
  var s = d.getElementsByTagName('script')[0];
  g.async = true;
  g.src = u + 'script.js';
  s.parentNode.insertBefore(g, s);
})();

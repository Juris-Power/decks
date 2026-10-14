/**
 * Juris-Connect — Embed widget JS loader
 *
 * Alternative au <iframe> : s'injecte directement sur le site de l'avocat.
 * Simple d'intégration : 1 ligne de <script> + zéro dépendance.
 *
 * Usage minimal :
 *   <script src="https://juris-connect.fr/embed/lawyer-plans.js"
 *           data-slug="marie-durand"></script>
 *
 * Options supportées (en data-attributes) :
 *   data-slug (required)        — slug de l'avocat (account.lawyer.link)
 *   data-theme (light|dark)     — défaut light
 *   data-layout (grid|list)     — défaut grid
 *   data-primary (hex color)    — défaut #0077CC
 *   data-height (number px)     — défaut 520
 *   data-target (CSS selector)  — défaut : le script lui-même (insère juste avant)
 *
 * Le script crée un <iframe> pointant sur /embed/lawyer/:slug/plans avec
 * les paramètres. Raison : 0 risque de conflit CSS/JS avec le site host,
 * même comportement que l'iframe manuel mais en 1 ligne. On peut faire
 * évoluer vers un rendu inline DOM plus tard si besoin (V3).
 *
 * Garanties :
 *  - 0 dépendance (vanilla JS)
 *  - IIFE isolée (pas de pollution globale)
 *  - Lazy loading de l'iframe
 *  - Resize responsive (largeur 100% du container, hauteur fixe configurable)
 */
(function () {
  'use strict';

  // Trouve le script courant (le dernier <script> dans le DOM au moment de l'exécution inline).
  var scripts = document.getElementsByTagName('script');
  var current = scripts[scripts.length - 1];
  if (!current) return;

  var slug = current.getAttribute('data-slug');
  if (!slug) {
    console.warn(
      '[juris-power-embed] data-slug manquant sur <script>. Exemple : ' +
        '<script src="https://juris-connect.fr/embed/lawyer-plans.js" data-slug="marie-durand"></script>',
    );
    return;
  }

  var theme = current.getAttribute('data-theme') || 'light';
  var layout = current.getAttribute('data-layout') || 'grid';
  var primary = current.getAttribute('data-primary') || '#0077CC';
  var height = parseInt(current.getAttribute('data-height') || '520', 10);
  var targetSelector = current.getAttribute('data-target');

  // Construit l'URL à partir de l'origine du script lui-même (évite
  // l'hardcode du domaine → fonctionne en dev/beta/prod).
  var src = current.src || '';
  var origin;
  try {
    origin = new URL(src).origin;
  } catch (_) {
    origin = 'https://juris-connect.fr';
  }

  var params = new URLSearchParams({
    theme: theme,
    layout: layout,
    primary: primary,
  });
  var iframeSrc =
    origin + '/embed/lawyer/' + encodeURIComponent(slug) + '/plans?' + params.toString();

  var iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.title = 'Prestations juridiques';
  iframe.loading = 'lazy';
  iframe.width = '100%';
  iframe.height = String(height);
  iframe.style.cssText =
    'border:none;max-width:860px;display:block;margin:0 auto;';
  iframe.setAttribute('frameborder', '0');

  var container;
  if (targetSelector) {
    container = document.querySelector(targetSelector);
    if (!container) {
      console.warn(
        '[juris-power-embed] data-target="' +
          targetSelector +
          '" introuvable, injection avant le <script>',
      );
    }
  }

  if (container) {
    container.appendChild(iframe);
  } else if (current.parentNode) {
    current.parentNode.insertBefore(iframe, current);
  }

  // Exposition minimale : permet un refresh programmatique (ex: theme dynamique).
  // JurisPowerEmbed reste exposé tel quel : c'est une API publique, qu'un site
  // tiers peut appeler. JurisConnectEmbed la double sous le nom de la marque.
  window.JurisPowerEmbed = window.JurisPowerEmbed || {
    refresh: function (options) {
      if (!options) return;
      var p = new URLSearchParams({
        theme: options.theme || theme,
        layout: options.layout || layout,
        primary: options.primary || primary,
      });
      iframe.src =
        origin +
        '/embed/lawyer/' +
        encodeURIComponent(slug) +
        '/plans?' +
        p.toString();
    },
  };
  window.JurisConnectEmbed = window.JurisConnectEmbed || window.JurisPowerEmbed;

})();

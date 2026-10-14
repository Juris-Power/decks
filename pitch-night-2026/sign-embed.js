/**
 * Juris-Connect — SDK iFrame de signature électronique (BIC-7 #87)
 *
 * Intègre la page de signature whitelabel dans le site d'un cabinet :
 *   <div id="jp-sign"></div>
 *   <script src="https://juris-connect.fr/sign-embed.js"
 *     data-token="SIGNATURE_TOKEN"
 *     data-target="#jp-sign"
 *     data-height="720"
 *     data-on-signed="onSigned"
 *     data-on-error="onError">
 *   </script>
 *
 * Attributs :
 *   data-token    (requis) — token de la demande de signature (lien magic-link)
 *   data-target   (optionnel) — sélecteur du conteneur (défaut : insertion inline)
 *   data-height   (optionnel) — hauteur px de l'iframe (défaut : 720)
 *   data-on-signed (optionnel) — nom d'une fonction globale appelée au succès
 *   data-on-error  (optionnel) — nom d'une fonction globale appelée à l'erreur
 *
 * SÉCURITÉ :
 *   - L'iframe charge `<origin>/sign/<token>?embed=1` (whitelabel, sans chrome
 *     Mediane). L'origine de l'iframe = l'origine du script (juris-connect.fr).
 *   - Le SDK n'accepte QUE les messages dont `event.origin === <origin du SDK>`
 *     ET `event.data.source === 'juris-power-sign'` → pas de spoofing tiers.
 *   - Le message entrant ne porte aucun secret (type + requestId).
 *
 * NB infra : l'embedding suppose que le serveur SPA autorise le cabinet dans le
 *   CSP `frame-ancestors` (décision infra per-cabinet). Sinon le navigateur
 *   bloque l'iframe (frame-ancestors 'none' par défaut).
 *
 * @see front/src/features/sign-public/hooks/useSignEmbed.ts (émetteur)
 * @see documentation/api-reference/signature-embed-sdk.md
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var token = script.getAttribute('data-token');
  if (!token) {
    console.warn('[Juris-Connect Sign] data-token attribute is required');
    return;
  }

  var origin = script.src
    ? new URL(script.src).origin
    : 'https://juris-connect.fr';
  var targetSel = script.getAttribute('data-target');
  var height = parseInt(script.getAttribute('data-height') || '720', 10);
  var onSignedName = script.getAttribute('data-on-signed');
  var onErrorName = script.getAttribute('data-on-error');

  var SOURCE = 'juris-power-sign';
  var iframeUrl =
    origin + '/sign/' + encodeURIComponent(token) + '?embed=1';

  // ========== IFRAME ==========
  var iframe = document.createElement('iframe');
  iframe.src = iframeUrl;
  iframe.title = 'Signature électronique';
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.style.width = '100%';
  iframe.style.minHeight = height + 'px';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '12px';
  iframe.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';

  var container = targetSel ? document.querySelector(targetSel) : null;
  if (container) {
    container.appendChild(iframe);
  } else {
    // Insertion inline juste après le script si aucun conteneur fourni.
    script.parentNode.insertBefore(iframe, script.nextSibling);
  }

  // ========== MESSAGE LISTENER (origin + source vérifiés) ==========
  function callGlobal(name, detail) {
    if (name && typeof window[name] === 'function') {
      try {
        window[name](detail);
      } catch (e) {
        console.error('[Juris-Connect Sign] callback error', e);
      }
    }
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== origin) return; // anti-spoofing : origine stricte
    var data = event.data;
    if (!data || data.source !== SOURCE) return;

    switch (data.type) {
      case 'jp-sign:loaded':
        // L'iframe est prête (réservé à un futur auto-resize).
        break;
      case 'jp-sign:signed':
        callGlobal(onSignedName, {
          requestId: data.requestId,
          level: data.level,
        });
        document.dispatchEvent(
          new CustomEvent('jp-sign:signed', { detail: data }),
        );
        break;
      case 'jp-sign:error':
        callGlobal(onErrorName, { message: data.message });
        document.dispatchEvent(
          new CustomEvent('jp-sign:error', { detail: data }),
        );
        break;
      default:
        break;
    }
  });
})();

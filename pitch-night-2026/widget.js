/**
 * Juris-Connect Booking Widget
 *
 * Embed on any lawyer website:
 *   <script src="https://juris-connect.fr/widget.js"
 *     data-lawyer="me-dupont-123abc"
 *     data-color="#0077CC"
 *     data-position="right"
 *     data-text="Prendre RDV">
 *   </script>
 *
 * Attributes:
 *   data-lawyer   (required) — Lawyer slug or ID
 *   data-color    (optional) — Accent color (default: #0077CC)
 *   data-position (optional) — "right" or "left" (default: right)
 *   data-text     (optional) — Button text (default: "Prendre RDV")
 *   data-mode     (optional) — "popup" or "slide" (default: popup)
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var lawyerSlug = script.getAttribute('data-lawyer');
  if (!lawyerSlug) {
    console.warn('[Juris-Connect Widget] data-lawyer attribute is required');
    return;
  }

  var accentColor = script.getAttribute('data-color') || '#0077CC';
  var position = script.getAttribute('data-position') || 'right';
  var buttonText = script.getAttribute('data-text') || 'Prendre RDV';
  var origin = script.src ? new URL(script.src).origin : 'https://juris-connect.fr';
  var embedUrl = origin + '/embed/' + encodeURIComponent(lawyerSlug) + '?color=' + encodeURIComponent(accentColor);

  // ========== STYLES ==========
  var CSS_ID = 'jp-widget-styles';
  if (!document.getElementById(CSS_ID)) {
    var style = document.createElement('style');
    style.id = CSS_ID;
    style.textContent = [
      '.jp-widget-btn{',
      '  position:fixed;bottom:24px;' + position + ':24px;z-index:999999;',
      '  display:flex;align-items:center;gap:8px;',
      '  padding:14px 24px;border:none;border-radius:50px;',
      '  background:' + accentColor + ';color:#fff;',
      '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
      '  font-size:15px;font-weight:600;cursor:pointer;',
      '  box-shadow:0 4px 20px rgba(0,0,0,0.2);',
      '  transition:transform 0.2s,box-shadow 0.2s;',
      '}',
      '.jp-widget-btn:hover{transform:translateY(-2px);box-shadow:0 6px 28px rgba(0,0,0,0.25);}',
      '.jp-widget-btn svg{width:20px;height:20px;fill:currentColor;}',
      '.jp-widget-overlay{',
      '  position:fixed;inset:0;z-index:999998;background:rgba(0,0,0,0.4);',
      '  opacity:0;transition:opacity 0.25s;pointer-events:none;',
      '}',
      '.jp-widget-overlay.open{opacity:1;pointer-events:auto;}',
      '.jp-widget-frame{',
      '  position:fixed;z-index:999999;',
      '  background:#fff;border-radius:16px;overflow:hidden;',
      '  box-shadow:0 20px 60px rgba(0,0,0,0.3);',
      '  transition:transform 0.3s cubic-bezier(0.16,1,0.3,1),opacity 0.25s;',
      '  transform:translateY(40px);opacity:0;',
      '}',
      '.jp-widget-frame.open{transform:translateY(0);opacity:1;}',
      '.jp-widget-frame.pos-right{bottom:100px;right:24px;width:400px;height:560px;max-width:calc(100vw - 48px);max-height:calc(100vh - 140px);}',
      '.jp-widget-frame.pos-left{bottom:100px;left:24px;width:400px;height:560px;max-width:calc(100vw - 48px);max-height:calc(100vh - 140px);}',
      '.jp-widget-close{',
      '  position:absolute;top:8px;right:8px;z-index:1;',
      '  width:32px;height:32px;border:none;border-radius:50%;',
      '  background:rgba(0,0,0,0.06);cursor:pointer;',
      '  display:flex;align-items:center;justify-content:center;',
      '  font-size:18px;color:#666;transition:background 0.15s;',
      '}',
      '.jp-widget-close:hover{background:rgba(0,0,0,0.12);}',
      '@media(max-width:480px){',
      '  .jp-widget-frame.pos-right,.jp-widget-frame.pos-left{',
      '    bottom:0;left:0;right:0;width:100%;height:85vh;',
      '    border-radius:16px 16px 0 0;',
      '    transform:translateY(100%);',
      '  }',
      '  .jp-widget-frame.open{transform:translateY(0);}',
      '  .jp-widget-btn{bottom:16px;' + position + ':16px;padding:12px 20px;font-size:14px;}',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  // ========== DOM ==========
  var isOpen = false;

  // Floating button
  var btn = document.createElement('button');
  btn.className = 'jp-widget-btn';
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17 2H7a2 2 0 0 0-2 2v16l7-3 7 3V4a2 2 0 0 0-2-2z"/></svg>' + buttonText;
  btn.setAttribute('aria-label', buttonText);

  // Overlay
  var overlay = document.createElement('div');
  overlay.className = 'jp-widget-overlay';

  // Frame container
  var frame = document.createElement('div');
  frame.className = 'jp-widget-frame pos-' + position;

  // Close button
  var closeBtn = document.createElement('button');
  closeBtn.className = 'jp-widget-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Fermer');

  // Iframe
  var iframe = document.createElement('iframe');
  iframe.style.cssText = 'width:100%;height:100%;border:none;';
  iframe.setAttribute('loading', 'lazy');
  iframe.title = 'Juris-Connect — Prendre rendez-vous';

  frame.appendChild(closeBtn);
  frame.appendChild(iframe);

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      // Lazy load iframe on first open
      if (!iframe.src) iframe.src = embedUrl;
      overlay.classList.add('open');
      frame.classList.add('open');
      btn.style.display = 'none';
    } else {
      overlay.classList.remove('open');
      frame.classList.remove('open');
      btn.style.display = '';
    }
  }

  btn.addEventListener('click', toggle);
  overlay.addEventListener('click', toggle);
  closeBtn.addEventListener('click', toggle);

  // Listen for messages from the embed iframe
  window.addEventListener('message', function (e) {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.type === 'jp-widget-navigate') {
      // Open booking in new tab
      window.open(e.data.url, '_blank');
      toggle(); // Close widget
    }
    if (e.data.type === 'jp-widget-resize' && e.data.height) {
      // Dynamic height adjustment (capped)
      var h = Math.min(e.data.height + 20, window.innerHeight * 0.85);
      frame.style.height = h + 'px';
    }
    if (e.data.type === 'jp-widget-close') {
      if (isOpen) toggle();
    }
  });

  // Inject into DOM
  document.body.appendChild(overlay);
  document.body.appendChild(frame);
  document.body.appendChild(btn);
})();

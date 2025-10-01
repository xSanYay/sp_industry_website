// Centralized Footer System for AMBER/SP Industries
// Loads external footer HTML (includes/footer.html) with robust fallbacks & diagnostics
(function() {
  'use strict';

  const FOOTER_PATH = 'includes/footer.html';
  const CONTAINER_ID = 'footer-container';

  function ensureContainer() {
    let el = document.getElementById(CONTAINER_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = CONTAINER_ID;
      document.body.appendChild(el);
    }
    return el;
  }

  function isFileProtocol() {
    return window.location.protocol === 'file:';
  }

  function injectFallback(container, reason) {
    container.innerHTML = `<footer style="background:#222;color:#eee;padding:24px 0;text-align:center;font:14px/1.4 system-ui,Arial,sans-serif">
        <div style="max-width:960px;margin:0 auto;padding:0 16px">
          <p style="margin:0 0 4px">©2020 S.P Industries - All rights reserved.</p>
          <p style="margin:0;font-size:12px;opacity:.7">Footer failed to load (${reason}).</p>
        </div>
      </footer>`;
  }

  function log(msg, type = 'info') {
    const prefix = '[FooterLoader]';
    if (type === 'error') console.error(prefix, msg); else console.log(prefix, msg);
  }

  function loadWithFetch(container) {
    log(`Attempting fetch of ${FOOTER_PATH}`);
    return fetch(FOOTER_PATH, { cache: 'no-cache' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(html => {
        container.innerHTML = html;
        log('Footer loaded via fetch');
        stripEmbeddedScripts(container);
        return true;
      });
  }

  function loadWithXHR(container) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', FOOTER_PATH, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
            container.innerHTML = xhr.responseText;
            log('Footer loaded via XHR (file protocol fallback)');
            stripEmbeddedScripts(container);
            resolve(true);
          } else {
            reject(new Error(`XHR status ${xhr.status}`));
          }
        }
      };
      xhr.send();
    });
  }

  function stripEmbeddedScripts(container) {
    // Remove any <script> tags inside footer.html to avoid duplicate library loads
    const scripts = container.querySelectorAll('script');
    scripts.forEach(s => {
      // Keep only inline bootstrap requirement if needed (currently none)
      s.remove();
    });
  }

  function loadWithJQuery(container) {
    return new Promise((resolve, reject) => {
      if (typeof jQuery === 'undefined') return reject(new Error('jQuery missing'));
      jQuery(container).load(FOOTER_PATH, function(response, status, xhr) {
        if (status === 'error') {
          return reject(new Error(`jQuery load error ${xhr.status}`));
        }
        stripEmbeddedScripts(container);
        log('Footer loaded via jQuery .load()');
        resolve(true);
      });
    });
  }

  async function loadFooter() {
    const container = ensureContainer();

    // If already loaded, skip
    if (container.getAttribute('data-footer-loaded') === 'true') {
      return;
    }

    try {
      if (typeof jQuery !== 'undefined') {
        await loadWithJQuery(container);
      } else if (isFileProtocol()) {
        // file:// cannot use fetch reliably for relative includes across directories
        await loadWithXHR(container);
      } else {
        await loadWithFetch(container);
      }
      container.setAttribute('data-footer-loaded', 'true');
    } catch (e1) {
      log(e1.message, 'error');
      try {
        if (!isFileProtocol()) {
          // Try XHR as secondary even over http (rarely needed)
          await loadWithXHR(container);
          container.setAttribute('data-footer-loaded', 'true');
        } else {
          throw e1;
        }
      } catch (e2) {
        log(e2.message, 'error');
        injectFallback(container, e2.message);
      }
    }
  }

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn();
  }

  onReady(loadFooter);

  window.FooterManager = { load: loadFooter };
})();

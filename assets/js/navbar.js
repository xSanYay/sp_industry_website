// Centralized Navbar Loader
// Similar pattern to footer loader with active link highlighting
(function() {
  'use strict';

  const NAV_PATH = 'includes/navbar.html';
  const TARGET_ID = 'navbar-container';

  function ensureContainer() {
    let c = document.getElementById(TARGET_ID);
    if (!c) {
      c = document.createElement('div');
      c.id = TARGET_ID;
      // Insert at top of body for safety if not present
      document.body.insertBefore(c, document.body.firstChild);
    }
    return c;
  }

  function currentPageName() {
    const p = window.location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  function highlightActive(container) {
    const page = currentPageName().toLowerCase();
    const links = container.querySelectorAll('#main-nav-links li');
    links.forEach(li => {
      const liPage = (li.getAttribute('data-page') || '').toLowerCase();
      if (liPage === page) {
        li.classList.add('current-page');
      } else {
        li.classList.remove('current-page');
      }
    });
  }

  function stripLineBreakArtifacts(html) {
    return html.replace(/\r/g, '');
  }

  function loadWithFetch(container) {
    return fetch(NAV_PATH, { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(html => { container.innerHTML = stripLineBreakArtifacts(html); highlightActive(container); });
  }

  function loadWithXHR(container) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', NAV_PATH, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
            container.innerHTML = stripLineBreakArtifacts(xhr.responseText);
            highlightActive(container);
            resolve();
          } else {
            reject(new Error('XHR status ' + xhr.status));
          }
        }
      };
      xhr.send();
    });
  }

  function loadWithJQuery(container) {
    return new Promise((resolve, reject) => {
      if (typeof jQuery === 'undefined') return reject(new Error('jQuery missing'));
      jQuery(container).load(NAV_PATH, function(response, status, xhr) {
        if (status === 'error') return reject(new Error('jQuery load error ' + xhr.status));
        highlightActive(container);
        resolve();
      });
    });
  }

  async function init() {
    const container = ensureContainer();
    try {
      if (typeof jQuery !== 'undefined') {
        await loadWithJQuery(container);
      } else if (window.location.protocol === 'file:') {
        await loadWithXHR(container);
      } else {
        await loadWithFetch(container);
      }
    } catch (e1) {
      console.error('[NavbarLoader]', e1.message);
      try {
        if (window.location.protocol !== 'file:') {
          await loadWithXHR(container);
        } else {
          throw e1;
        }
      } catch (e2) {
        console.error('[NavbarLoader]', e2.message);
        container.innerHTML = '<div style="padding:12px;background:#f8d7da;color:#721c24;font:14px/1.4 system-ui;">Navbar failed to load.</div>';
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.NavbarManager = { reload: init };
})();

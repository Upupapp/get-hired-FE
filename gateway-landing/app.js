(function () {
  'use strict';

  // Footer year.
  var yearEl = document.getElementById('gw-year');
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  // config.js is the single source of truth for both portal URLs. The
  // markup already carries sane hardcoded hrefs as a no-JS fallback --
  // this overwrites them from config so config.js is the one real place
  // to update when deploying, matching the environment.ts pattern used
  // in both Angular apps.
  var portals = window.GETHIRED_PORTALS;
  if (portals) {
    document.querySelectorAll('[data-portal]').forEach(function (el) {
      var portal = portals[el.getAttribute('data-portal')];
      var role = el.getAttribute('data-role');
      if (!portal) { return; }
      el.setAttribute('href', role === 'signin' ? portal.signin : portal.url);
    });
  }

  // Scroll/entrance reveal -- respects prefers-reduced-motion via the CSS
  // itself (the .gw-card--in class only adds an opacity/transform change
  // that's already neutralized by the reduced-motion media query below).
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = document.querySelectorAll('.gw-card');
  if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
    cards.forEach(function (c) { c.classList.add('gw-card--in'); });
  } else {
    requestAnimationFrame(function () {
      cards.forEach(function (c, i) {
        setTimeout(function () { c.classList.add('gw-card--in'); }, i * 90);
      });
    });
  }
})();

/* Back to Outdoor – Fließ-Layer für die ganze Website. Keine Abhängigkeiten.
   Läuft nur mit html.fl (keine reduzierte Bewegung). Seiten mit eigener Scroll-
   Inszenierung (Startseite, Immobilien-Showcase) bekommen nur den "lite"-Teil. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('fl')) return;
  try {
    var nav = document.querySelector('header.site-nav');
    var lite = !!document.querySelector('#reviere, .stage');   // eigene Inszenierung vorhanden
    var h = innerHeight;
    function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

    /* ---------- Schnelle Seitenwechsel: Links beim Überfahren vorladen ---------- */
    try {
      if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
        var sr = document.createElement('script');
        sr.type = 'speculationrules';
        sr.textContent = JSON.stringify({ prefetch: [{ where: { and: [{ href_matches: '/*' }, { not: { href_matches: '/api/*' } }, { not: { selector_matches: '[target=_blank]' } }] }, eagerness: 'moderate' }] });
        document.head.appendChild(sr);
      }
    } catch (e) {}

    /* ---------- Hero (erste Überschrift) ---------- */
    var h1 = document.querySelector('h1');
    var own = root.classList.contains('fl-own');   // Seite hat eigene Hero-Inszenierung (Shop)
    var mobile = matchMedia('(max-width:760px)').matches;
    var hero = (!lite && !own && h1) ? h1.closest('section, header:not(.site-nav)') : null;
    if (hero && hero.matches('main, article, body')) hero = null;
    if (hero) hero.classList.add('fl-hero');

    /* ---------- Einblenden: Ziele markieren ---------- */
    var targets = [];
    if (!lite) {
      var SEL = [
        '.shop-card', '.ov-card', '.rel-card', '.cat-card', '.tour-box', '.note-box', '.j-shop-cta', '.shop-b2b',
        '.gear-intro', '.portfolio-region', '.step', '.part', '.row', '.shop-cat-header', '.section-head',
        'main h2', 'main h3', 'article h2', 'article h3', 'main figure', 'article figure', 'main blockquote', 'article blockquote',
        'main img', 'article img', '.about-body > *', '.about-body img'
      ].join(',');
      var SKIP = 'header, nav, footer, .site-nav, .fl-hero, [class*="hero"], .reveal, .rv, .stage, .modal, [role="dialog"], [data-no-flow], .logo-badge, .shop-ad-label, .burger';
      var all = [].slice.call(document.querySelectorAll(SEL));
      all.forEach(function (el) {
        if (el.closest(SKIP)) return;
        if (own && mobile && el.matches('.shop-card, .shop-cat-header')) return;   // Shop-Seite blendet diese mobil selbst ein
        if (el.parentElement && el.parentElement.closest('.fl-r')) return;      // Eltern schon markiert
        var r = el.getBoundingClientRect();
        if (r.top < h) return;                                                  // schon im/über dem Sichtfeld
        if (r.width === 0 && r.height === 0) return;                            // ausgeblendet
        el.classList.add('fl-r');
        if (el.tagName === 'IMG' || el.tagName === 'FIGURE') el.classList.add('fl-img');
        targets.push(el);
      });
      // Staffelung innerhalb einer Gruppe
      var seen = new Map();
      targets.forEach(function (el) {
        var p = el.parentElement, n = seen.get(p) || 0;
        el.style.setProperty('--i', Math.min(n, 5));
        seen.set(p, n + 1);
      });
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el = e.target;
            io.unobserve(el);
            el.classList.add('in');
            // Nach dem Einblenden zurück zum normalen Stil (Hover usw. bleibt unberührt)
            setTimeout(function () { el.classList.remove('fl-r', 'fl-img', 'in'); el.style.removeProperty('--i'); }, 1500 + (parseInt(el.style.getPropertyValue('--i') || '0', 10) * 70));
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
        targets.forEach(function (el) { io.observe(el); });
      } else {
        targets.forEach(function (el) { el.classList.remove('fl-r', 'fl-img'); });
      }
    }

    /* ---------- Fortschrittsbalken (nicht, wenn die Seite schon einen hat) ---------- */
    var bar = null;
    if (!lite) { bar = document.createElement('div'); bar.className = 'fl-bar'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar); }

    /* ---------- Scroll-Schleife ---------- */
    var ticking = false;
    function frame() {
      ticking = false;
      var y = scrollY;
      if (nav) nav.classList.toggle('is-scrolled', y > 8);
      if (bar) { var max = root.scrollHeight - h; bar.style.transform = 'scaleX(' + (max > 0 ? (y / max).toFixed(4) : 0) + ')'; }
      if (hero) { var r = hero.getBoundingClientRect(); if (r.bottom > 0) hero.style.setProperty('--hp', clamp(-r.top / r.height, 0, 1).toFixed(3)); }
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', function () { h = innerHeight; req(); });
    req();
  } catch (err) {
    // Im Fehlerfall alles sichtbar lassen
    [].forEach.call(document.querySelectorAll('.fl-r'), function (el) { el.classList.remove('fl-r', 'fl-img'); });
  }
})();

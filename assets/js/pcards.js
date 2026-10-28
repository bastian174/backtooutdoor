/* Back to Outdoor – Leistungs-Karte (Tabs, Autoplay) und Ablauf-Foto. Keine Abhängigkeiten. */
(function () {
  'use strict';
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Leistungen: Bildkarte ---------- */
  var sec = document.querySelector('.lc');
  if (sec) {
    var show = sec.querySelector('.lc-show');
    var slides = [].slice.call(sec.querySelectorAll('.lc-slide'));
    var tabs = [].slice.call(sec.querySelectorAll('.lc-nav button'));
    var cur = 0, timer = null, inView = false, hold = false, DUR = 8000;
    var arm = function () {
      clearTimeout(timer);
      var t = tabs[cur]; t.classList.remove('run'); void t.offsetWidth;
      if (still || hold || !inView) return;
      t.classList.add('run');
      timer = setTimeout(function () { go(cur + 1); }, DUR);
    };
    var go = function (i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, j) {
        var on = j === cur;
        s.classList.toggle('on', on);
        if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
        [].forEach.call(s.querySelectorAll('a'), function (a) { a.tabIndex = on ? 0 : -1; });
      });
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === cur ? 'true' : 'false'); t.classList.remove('run'); });
      arm();
    };
    tabs.forEach(function (t, j) { t.addEventListener('click', function () { go(j); }); });
    show.addEventListener('mouseenter', function () { hold = true; arm(); });
    show.addEventListener('mouseleave', function () { hold = false; arm(); });
    show.addEventListener('focusin', function () { hold = true; arm(); });
    show.addEventListener('focusout', function () { hold = false; arm(); });
    var sx = null;
    show.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    show.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
    sec.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(cur + 1); }
      else if (e.key === 'ArrowLeft') { go(cur - 1); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; go(cur); }, { threshold: .35 }).observe(show);
    } else { inView = true; go(0); }
    go(0);
  }

  /* ---------- Ablauf: Foto folgt dem aktiven Schritt ---------- */
  var ph = document.querySelector('.proc-ph');
  if (ph) {
    var pics = [].slice.call(ph.querySelectorAll('.hp'));
    var steps = [].slice.call(document.querySelectorAll('.process-step'));
    var pi = 0;
    var showPic = function (i) {
      if (i === pi && pics[i].classList.contains('on')) return;
      pi = i;
      pics.forEach(function (p, j) { p.classList.toggle('on', j === i); });
    };
    showPic(0);
    var tk = false;
    var follow = function () {
      tk = false;
      var r = ph.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var k = 0, mid = innerHeight * .62;
      steps.forEach(function (s, j) { if (s.getBoundingClientRect().top < mid) k = j; });
      if (pics[k]) showPic(k);
    };
    addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(follow); } }, { passive: true });
    steps.forEach(function (s, k) {
      s.addEventListener('mouseenter', function () { if (pics[k]) showPic(k); });
    });
    /* Handy: Foto steht über den Schritten und wechselt von selbst */
    if (!still && window.matchMedia && matchMedia('(max-width:960px)').matches && 'IntersectionObserver' in window) {
      var vis = false, iv = null;
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }, { threshold: .4 }).observe(ph);
      iv = setInterval(function () { if (vis) showPic((pi + 1) % pics.length); }, 3400);
    }
  }
})();

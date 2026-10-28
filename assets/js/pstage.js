/* Back to Outdoor – Portfolio-Bühne (DE / EN / FR). Keine Abhängigkeiten.
   Videos laden erst in der Nähe der Bühne. 3D-Flug nur mit html.fx. */
(function () {
  'use strict';
  var root = document.documentElement;
  var stage = document.getElementById('arbeit');
  if (!stage) return;
  var fx = root.classList.contains('fx');
  var pin = stage.querySelector('.pstage-pin');
  var steps = [].slice.call(stage.querySelectorAll('.pstage-steps li'));
  var slides = [].slice.call(stage.querySelectorAll('.pn-slide'));
  var tag = stage.querySelector('.dev.pin .tag');
  var tagBase = tag ? tag.getAttribute('data-base') || tag.textContent : '';
  var vids = [].slice.call(stage.querySelectorAll('video'));
  var h = innerHeight, navh = 68;

  /* ---------- Videos nur laden/abspielen, solange die Bühne in der Nähe ist ---------- */
  function load(v) {
    if (!v.getAttribute('src')) v.setAttribute('src', v.getAttribute('data-v'));
    var q = v.play(); if (q && q.catch) q.catch(function () {});
  }
  if (fx && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        vids.forEach(function (v) { if (e.isIntersecting) load(v); else v.pause(); });
        running = e.isIntersecting;
      });
    }, { rootMargin: '300px' }).observe(stage);
  }

  /* ---------- Pin: Fotos aus vier Revieren wechseln ---------- */
  var si = 0, running = false, timer = null;
  function showSlide(i) {
    slides.forEach(function (s, j) { s.classList.toggle('on', j === i); });
    if (tag) { var r = slides[i] && slides[i].getAttribute('data-region'); tag.textContent = tagBase + (r ? ' · ' + r : ''); }
  }
  showSlide(0);
  if (fx && slides.length > 1) {
    timer = setInterval(function () { if (!running) return; si = (si + 1) % slides.length; showSlide(si); }, 3200);
  }

  if (!fx) return;

  /* ---------- Bühne ---------- */
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function mix(a, b, t) { var o = {}; for (var k in a) o[k] = a[k] + (b[k] - a[k]) * t; return o; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  var START = { x: 0, y: 60, z: -1100, ry: 45, rx: 14, o: 0 };
  var P = [
    { phone: { x: -40, y: 0, z: 180, ry: -14, rx: 2, o: 1 }, laptop: { x: 170, y: -40, z: -160, ry: -28, rx: 4, o: .55 }, pin: { x: 310, y: 40, z: -320, ry: -34, rx: 4, o: .4 } },
    { laptop: { x: 20, y: -10, z: 140, ry: -10, rx: 3, o: 1 }, phone: { x: -250, y: 20, z: -120, ry: 28, rx: 2, o: .5 }, pin: { x: 300, y: 30, z: -200, ry: -30, rx: 4, o: .5 } },
    { pin: { x: 90, y: 0, z: 190, ry: -12, rx: 2, o: 1 }, laptop: { x: -130, y: -30, z: -240, ry: 24, rx: 4, o: .45 }, phone: { x: -250, y: 20, z: -160, ry: 30, rx: 2, o: .4 } }
  ];
  var dev = {};
  [].forEach.call(stage.querySelectorAll('.dev'), function (d) { dev[d.getAttribute('data-d')] = { el: d, cur: mix(START, START, 0) }; });
  var N = P.length, last = -1;

  function measure() {
    h = innerHeight;
    var nav = document.querySelector('header.site-nav');
    navh = nav ? nav.offsetHeight : 68;
    root.style.setProperty('--navh', navh + 'px');
  }
  measure();

  function setActive(i) {
    if (i === last) return; last = i;
    steps.forEach(function (li, j) { li.classList.toggle('on', j === i); });
  }
  steps.forEach(function (li, i) {
    li.addEventListener('click', function () {
      var r = stage.getBoundingClientRect();
      var range = r.height - pin.offsetHeight;
      scrollTo({ top: r.top + scrollY - navh + ((i + .5) / N) * range, behavior: 'smooth' });
    });
  });

  var ticking = false;
  function frame() {
    ticking = false;
    var r = stage.getBoundingClientRect();
    if (!(r.bottom > 0 && r.top < h)) return;
    var range = r.height - pin.offsetHeight;
    var p = clamp((navh - r.top) / range, 0, 1);
    var e = clamp((h - r.top) / h, 0, 1);
    var i = 0, k2 = 0, idx = 0;
    if (e >= 1) {
      var q = p * N; i = Math.min(N - 1, Math.floor(q));
      var f = q - i, tr = .3;
      k2 = (i < N - 1 && f > 1 - tr) ? ease((f - (1 - tr)) / tr) : 0;
      idx = k2 > .5 ? i + 1 : i;
    }
    var moving = false;
    for (var n in dev) {
      var d = dev[n], c = d.cur, g;
      if (e < 1) g = mix(START, P[0][n], ease(e));
      else g = k2 ? mix(P[i][n], P[i + 1][n], k2) : P[i][n];
      for (var key in c) { var nv = c[key] + (g[key] - c[key]) * .16; if (Math.abs(nv - g[key]) > .05) moving = true; c[key] = nv; }
      d.el.style.transform = 'translate3d(' + c.x + 'px,' + c.y + 'px,' + c.z + 'px) rotateY(' + c.ry + 'deg) rotateX(' + c.rx + 'deg)';
      d.el.style.opacity = c.o;
      d.el.style.zIndex = Math.round(c.z + 1000);
    }
    setActive(idx);
    if (moving) req();
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', function () { measure(); req(); });
  addEventListener('load', function () { measure(); req(); });
  req();
})();

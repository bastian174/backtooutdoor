/* Back to Outdoor – Cinematic Scroll für die Startseite (DE / EN / FR)
   Keine Abhängigkeiten. Läuft nur, wenn <html> die Klasse "fx" trägt
   (wird im <head> gesetzt, wenn keine reduzierte Bewegung gewünscht ist). */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('fx')) return;

  var nav = document.querySelector('header.site-nav');
  var hero = document.getElementById('home');
  var heroVideo = hero ? hero.querySelector('.hero-video-bg') : null;
  var stage = document.getElementById('reviere');
  var pin = stage ? stage.querySelector('.reviere-pin') : null;
  var cards = stage ? [].slice.call(stage.querySelectorAll('.rcard')) : [];
  var steps = stage ? [].slice.call(stage.querySelectorAll('.reviere-steps li')) : [];
  var caption = stage ? stage.querySelector('.reviere-caption') : null;
  var processWrap = document.querySelector('.process-wrap');
  var processSteps = [].slice.call(document.querySelectorAll('.process-step'));
  var drawLine = document.querySelector('.draw-line');
  var pimgs = [].slice.call(document.querySelectorAll('.portfolio-banner img'));

  var h = innerHeight, navh = 68;
  function measure() {
    h = innerHeight;
    navh = nav ? nav.offsetHeight : 68;
    root.style.setProperty('--navh', navh + 'px');
  }
  measure();

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function mix(a, b, t) { var o = {}; for (var k in a) o[k] = a[k] + (b[k] - a[k]) * t; return o; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* ---------- Fortschrittsbalken ---------- */
  var bar = document.createElement('div');
  bar.className = 'h3d-bar';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  /* ---------- Hero-Video nur abspielen, solange sichtbar ---------- */
  if (heroVideo && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { var q = heroVideo.play(); if (q && q.catch) q.catch(function () {}); }
        else heroVideo.pause();
      });
    }).observe(hero);
  }

  /* ---------- Hero: Mausbewegung (nur Geräte mit Maus) ---------- */
  var mx = 0, my = 0, mTick = false;
  if (hero && window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - .5;
      my = (e.clientY - r.top) / r.height - .5;
      if (!mTick) {
        mTick = true;
        requestAnimationFrame(function () {
          mTick = false;
          hero.style.setProperty('--mx', mx.toFixed(3));
          hero.style.setProperty('--my', my.toFixed(3));
        });
      }
    }, { passive: true });
  }

  /* ---------- Reviere-Bühne ---------- */
  var START = { x: 0, y: 60, z: -1100, ry: 45, rx: 14, o: 0 };
  function buildPoses(n) {
    var P = [];
    for (var i = 0; i < n; i++) {
      var st = [];
      for (var j = 0; j < n; j++) {
        var k = j - i, a = Math.abs(k);
        if (k === 0) st.push({ x: 0, y: 0, z: 170, ry: -8, rx: 2, o: 1 });
        else if (k < 0) st.push({ x: -250 + k * 18, y: 14, z: -240 + k * 50, ry: 32, rx: 2, o: Math.max(0, .5 - .18 * (a - 1)) });
        else st.push({ x: 230 + (k - 1) * 70, y: 24, z: -190 - (k - 1) * 130, ry: -32, rx: 3, o: Math.max(.2, .62 - .16 * (k - 1)) });
      }
      P.push(st);
    }
    return P;
  }
  var N = cards.length;
  var POSES = N ? buildPoses(N) : [];
  var cur = cards.map(function () { return mix(START, START, 0); });
  var lastIdx = -1;
  var captions = steps.map(function (li) { var em = li.querySelector('em'); return em ? em.textContent : ''; });

  // Schritte zu echten, per Tastatur bedienbaren Buttons machen
  steps.forEach(function (li, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    while (li.firstChild) btn.appendChild(li.firstChild);
    li.appendChild(btn);
    btn.addEventListener('click', function () { goTo(i); });
  });
  function goTo(i) {
    if (!stage) return;
    var r = stage.getBoundingClientRect();
    var range = r.height - pin.offsetHeight;
    var top = r.top + scrollY - navh + ((i + .5) / N) * range;
    scrollTo({ top: top, behavior: 'smooth' });
  }
  function setActive(i) {
    if (i === lastIdx) return;
    lastIdx = i;
    steps.forEach(function (li, j) {
      var b = li.firstChild;
      li.classList.toggle('on', j === i);
      if (b && b.setAttribute) { if (j === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }
    });
    if (caption) caption.textContent = captions[i] || '';
  }

  function stageFrame() {
    if (!N) return false;
    var r = stage.getBoundingClientRect();
    if (!(r.bottom > 0 && r.top < h)) return false;
    var range = r.height - pin.offsetHeight;
    var p = clamp((navh - r.top) / range, 0, 1);
    var e = clamp((h - r.top) / h, 0, 1);   // Anflug, solange die Bühne hereinscrollt
    var idx, k2 = 0, i = 0;
    if (e < 1) { idx = 0; }
    else {
      var q = p * N; i = Math.min(N - 1, Math.floor(q));
      var f = q - i, tr = .3;
      k2 = (i < N - 1 && f > 1 - tr) ? ease((f - (1 - tr)) / tr) : 0;
      idx = k2 > .5 ? i + 1 : i;
    }
    var moving = false;
    for (var c = 0; c < N; c++) {
      var tg;
      if (e < 1) tg = mix(START, POSES[0][c], ease(e));
      else tg = k2 ? mix(POSES[i][c], POSES[i + 1][c], k2) : POSES[i][c];
      var s = cur[c];
      for (var key in s) {
        var nv = s[key] + (tg[key] - s[key]) * .16;
        if (Math.abs(nv - tg[key]) > .05) moving = true;
        s[key] = nv;
      }
      var el = cards[c];
      el.style.transform = 'translate3d(' + s.x + 'px,' + s.y + 'px,' + s.z + 'px) rotateY(' + s.ry + 'deg) rotateX(' + s.rx + 'deg)';
      el.style.opacity = s.o;
      el.style.zIndex = Math.round(s.z + 1000);
    }
    setActive(idx);
    return moving;
  }

  /* ---------- Ablauf: Linie + Schritte folgen dem Scrollen ---------- */
  function processFrame() {
    if (!processWrap) return;
    var r = processWrap.getBoundingClientRect();
    if (!(r.bottom > -200 && r.top < h + 200)) return;
    var mark = h * .72;
    if (drawLine) drawLine.style.strokeDashoffset = String(300 * (1 - clamp((mark - r.top) / r.height, 0, 1)));
    processSteps.forEach(function (st) {
      st.classList.toggle('on', st.getBoundingClientRect().top < mark);
    });
  }

  /* ---------- Portfolio-Parallax ---------- */
  function parallaxFrame() {
    for (var i = 0; i < pimgs.length; i++) {
      var box = pimgs[i].parentNode.getBoundingClientRect();
      if (box.bottom < -50 || box.top > h + 50) continue;
      var t = ((box.top + box.height / 2) - h / 2) / (h / 2 + box.height / 2);  // -1 … 1
      pimgs[i].style.setProperty('--oy', (50 + clamp(t, -1, 1) * 22).toFixed(1) + '%');
    }
  }

  /* ---------- Hauptschleife ---------- */
  var ticking = false;
  function frame() {
    ticking = false;
    var y = scrollY, max = root.scrollHeight - h;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0).toFixed(4) + ')';
    if (hero) {
      var hr = hero.getBoundingClientRect();
      if (hr.bottom > 0) hero.style.setProperty('--hp', clamp(-hr.top / hr.height, 0, 1).toFixed(3));
    }
    var moving = stageFrame();
    processFrame();
    parallaxFrame();
    if (moving) req();
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', function () { measure(); req(); });
  addEventListener('load', function () { measure(); req(); });
  req();
})();

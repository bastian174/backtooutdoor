/* OPTIMIST PREIN – fliegender Schmetterling.
   Das echte Logo fliegt beim Scrollen von Abschnitt zu Abschnitt.
   Wegpunkte in % des Fensters (x, y) je Abschnitt; Desktop eher am Rand,
   damit kein Text verdeckt wird. Ohne Abhängigkeiten. */
(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var mobile = matchMedia('(max-width:900px)').matches;
  var WP = [ // Abschnitt-ID, Desktop x/y, Handy x/y
    ['top',          [80, 30], [86, 16]],
    ['studio',       [90, 22], [88, 14]],
    ['fuer-wen',     [12, 70], [10, 14]],
    ['leistungen',   [91, 18], [88, 12]],
    ['projekte',     [70, 22], [88, 12]],
    ['branchen',     [93, 14], [90, 10]],
    ['kanaele',      [56, 18], [86, 12]],
    ['projektseite', [92, 82], [10, 12]],
    ['marken',       [92, 16], [88, 12]],
    ['philosophie',  [26, 40], [86, 12]],
    ['ablauf',       [90, 24], [10, 12]],
    ['anfrage',      [93, 14], [88, 12]]
  ];
  var pts = WP.map(function (w) { return { el: document.getElementById(w[0]), p: mobile ? w[2] : w[1] }; })
              .filter(function (o) { return o.el; });
  if (!pts.length) return;

  var fly = document.createElement('div');
  fly.id = 'opFly'; fly.setAttribute('aria-hidden', 'true');
  fly.innerHTML = '<span class="w wl"></span><span class="w wr"></span>';
  document.body.appendChild(fly);

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function target() {
    var mid = innerHeight * .5, i = 0;
    for (var k = 0; k < pts.length; k++) if (pts[k].el.getBoundingClientRect().top <= mid) i = k;
    var a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)];
    var r = a.el.getBoundingClientRect();
    var t = clamp((mid - r.top) / Math.max(1, r.height), 0, 1);
    var e = ease(clamp((t - .6) / .4, 0, 1));          // erst gegen Ende zum nächsten Punkt
    return [(a.p[0] + (b.p[0] - a.p[0]) * e) / 100 * innerWidth,
            (a.p[1] + (b.p[1] - a.p[1]) * e) / 100 * innerHeight];
  }

  var x = innerWidth * .8, y = innerHeight * .3, rot = 0, lastY = scrollY, idle = 0;
  setTimeout(function () { fly.classList.add('on'); }, 900);

  function frame(now) {
    var t = now / 1000, tg = target();
    var wob = mobile ? 4 : 12;
    var tx = tg[0] + Math.sin(t * 1.3) * wob, ty = tg[1] + Math.cos(t * .9) * wob * .8;
    var nx = x + (tx - x) * .05, ny = y + (ty - y) * .05;
    var speed = Math.abs(nx - x) + Math.abs(ny - y);
    rot += (clamp((nx - x) * 2.2, -30, 30) - rot) * .1;
    x = nx; y = ny;
    fly.style.transform = 'translate3d(' + (x - fly.offsetWidth / 2) + 'px,' + (y - fly.offsetHeight / 2) + 'px,0) rotate(' + rot + 'deg)';
    // Gleiten, wenn er still steht; schneller Flügelschlag, wenn er fliegt
    idle = (speed < .6 && Math.abs(scrollY - lastY) < 1) ? idle + 1 : 0;
    fly.classList.toggle('glide', idle > 40);
    lastY = scrollY;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

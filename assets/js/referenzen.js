/* Back to Outdoor – Alle Referenzen: Revier wählen, Format wählen. Keine Abhängigkeiten. */
(function () {
  'use strict';
  var app = document.querySelector('.rf-app[data-rf]');
  if (!app) return;
  var rtabs = [].slice.call(app.querySelectorAll('.rf-regions [role="tab"]'));
  var panes = [].slice.call(app.querySelectorAll('.rf-pane'));
  var stopVideos = function (root) {
    [].forEach.call(root.querySelectorAll('video'), function (v) { try { v.pause(); } catch (e) {} });
  };
  var selectFormat = function (pane, key) {
    var btns = [].slice.call(pane.querySelectorAll('.rf-fmts [role="tab"]'));
    var views = [].slice.call(pane.querySelectorAll('.rf-view'));
    stopVideos(pane);
    views.forEach(function (v) { v.classList.toggle('on', v.getAttribute('data-f') === key); });
    btns.forEach(function (b) {
      var on = b.getAttribute('data-f') === key;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
  };
  var selectRegion = function (i, focus) {
    i = Math.max(0, Math.min(panes.length - 1, i));
    panes.forEach(function (p, j) {
      var on = j === i;
      if (!on) stopVideos(p);
      p.hidden = !on;
      p.classList.toggle('on', on);
    });
    rtabs.forEach(function (t, j) {
      var on = j === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    if (focus) rtabs[i].focus();
  };
  rtabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectRegion(i); });
    t.addEventListener('keydown', function (e) {
      var n = rtabs.length, k = null;
      if (e.key === 'ArrowRight') k = (i + 1) % n;
      else if (e.key === 'ArrowLeft') k = (i - 1 + n) % n;
      else if (e.key === 'Home') k = 0;
      else if (e.key === 'End') k = n - 1;
      if (k !== null) { e.preventDefault(); selectRegion(k, true); }
    });
  });
  panes.forEach(function (p) {
    var btns = [].slice.call(p.querySelectorAll('.rf-fmts [role="tab"]'));
    btns.forEach(function (b, k) {
      b.addEventListener('click', function () { selectFormat(p, b.getAttribute('data-f')); });
      b.addEventListener('keydown', function (e) {
        var n = btns.length, j = null;
        if (e.key === 'ArrowRight') j = (k + 1) % n;
        else if (e.key === 'ArrowLeft') j = (k - 1 + n) % n;
        if (j !== null) { e.preventDefault(); selectFormat(p, btns[j].getAttribute('data-f')); btns[j].focus(); }
      });
    });
  });
  /* Links aus der Revier-Karte oben öffnen das passende Revier */
  [].forEach.call(document.querySelectorAll('a[data-rf]'), function (a) {
    a.addEventListener('click', function () {
      var i = parseInt(a.getAttribute('data-rf'), 10);
      if (!isNaN(i)) selectRegion(i);
    });
  });
})();

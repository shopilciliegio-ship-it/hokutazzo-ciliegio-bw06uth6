// Recensioni a scorrimento (home): swipe sul telefono, frecce, avanzamento automatico lento.
// Si ferma se l'utente tocca/scorre o se ha "riduci animazioni"; senza JS resta uno scorrimento a mano.
(function () {
  'use strict';
  var box = document.querySelector('[data-rv]');
  if (!box) return;
  var track = box.querySelector('.rv-track');
  var cards = track.children;
  var timer = null, stopped = false;

  function step() { var c = cards[0]; return c ? c.getBoundingClientRect().width + 20 : 340; }
  function go(dir) {
    var max = track.scrollWidth - track.clientWidth;
    if (dir > 0 && track.scrollLeft >= max - 4) track.scrollTo({ left: 0, behavior: 'smooth' });
    else if (dir < 0 && track.scrollLeft <= 4) track.scrollTo({ left: max, behavior: 'smooth' });
    else track.scrollBy({ left: dir * step(), behavior: 'smooth' });
  }
  function stop() { stopped = true; if (timer) { clearInterval(timer); timer = null; } }

  box.querySelectorAll('.rv-btn').forEach(function (b) {
    b.addEventListener('click', function () { stop(); go(parseInt(b.getAttribute('data-dir'), 10)); });
  });
  ['touchstart', 'pointerdown', 'wheel', 'keydown', 'focusin'].forEach(function (ev) {
    track.addEventListener(ev, stop, { passive: true });
  });

  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm) {
    timer = setInterval(function () {
      if (stopped || document.hidden) return;
      var r = box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return; // avanza solo se si vede
      go(1);
    }, 5500);
  }
})();

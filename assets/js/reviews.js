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

  // Recensioni vere: se il file scritto dal CSM (recensioni/recensioni.json, Google + TripAdvisor, solo 4-5 stelle,
  // dalla più recente) è disponibile, sostituisce le citazioni fisse. Altrimenti restano quelle già in pagina.
  var BASE = 'https://raw.githubusercontent.com/shopilciliegio-ship-it/CiliegioSocialMedia/main/recensioni/recensioni.json';
  var en = (document.documentElement.lang || 'it').slice(0, 2) === 'en';
  function stelle(n) { var s = ''; for (var i = 0; i < 5; i++) s += i < n ? '★' : '☆'; return s; }
  function quando(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString(en ? 'en-GB' : 'it-IT', { month: 'long', year: 'numeric' });
  }
  if (window.fetch) {
    fetch(BASE, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        var items = (d && d.items) || [];
        if (items.length < 3) return;
        track.textContent = '';
        items.forEach(function (it) {
          var q = document.createElement('blockquote');
          q.className = 'quote';
          var st = document.createElement('p');
          st.className = 'rv-stars';
          st.setAttribute('aria-label', it.stelle + '/5');
          st.textContent = stelle(it.stelle);
          var p = document.createElement('p');
          p.textContent = it.testo;
          var f = document.createElement('footer');
          var quem = (it.autore || '') + ' · ' + (it.fonte || '');
          var when = it.data ? quando(it.data) : '';
          f.textContent = quem + (when ? ' · ' + when : '');
          q.appendChild(st); q.appendChild(p); q.appendChild(f);
          track.appendChild(q);
        });
        track.scrollLeft = 0;
        var sc = document.querySelector('[data-rv-score]');
        var pt = d.punteggi || {};
        var parts = [];
        Object.keys(pt).forEach(function (k) {
          if (pt[k] && pt[k].punteggio) parts.push(String(pt[k].punteggio).replace('.', en ? '.' : ',') + (en ? ' on ' : ' su ') + k);
        });
        if (sc && parts.length) { sc.textContent = '★ ' + parts.join('  ·  '); sc.hidden = false; }
      })
      .catch(function () { /* restano le citazioni fisse */ });
  }
})();

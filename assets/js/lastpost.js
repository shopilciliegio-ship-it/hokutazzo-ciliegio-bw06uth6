// Ultimo post Facebook sotto l'hero della home.
// Legge ultimo-post.json dal repo pubblico del CSM (scritto dopo ogni post uscito: lunedì, venerdì, extra).
// Se il file non si legge, la sezione resta nascosta: niente buchi né errori visibili.
(function () {
  'use strict';
  var box = document.querySelector('[data-lastpost]');
  if (!box || !window.fetch) return;
  var BASE = 'https://raw.githubusercontent.com/shopilciliegio-ship-it/CiliegioSocialMedia/main/ultimo-post/';
  var lang = (document.documentElement.lang || 'it').slice(0, 2);

  fetch(BASE + 'ultimo-post.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (p) {
      if (!p || !p.testo) return;
      box.querySelector('.lp-body').textContent = p.testo;
      try {
        var d = new Date(p.data);
        if (!isNaN(d)) box.querySelector('.lp-date').textContent =
          d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch (e) { /* data facoltativa */ }
      if (p.link && /^https:\/\/www\.facebook\.com\//.test(p.link)) {
        box.querySelectorAll('a').forEach(function (a) { a.href = p.link; });
      }
      if (p.foto) {
        var img = new Image();
        img.onload = function () {
          box.querySelector('.lp-img').style.backgroundImage = 'url("' + BASE + p.foto + '?t=' + encodeURIComponent(p.data || '') + '")';
          box.hidden = false;
        };
        img.onerror = function () { box.querySelector('.lp-grid').style.gridTemplateColumns = '1fr'; box.querySelector('.lp-img').style.display = 'none'; box.hidden = false; };
        img.src = BASE + p.foto + '?t=' + encodeURIComponent(p.data || '');
      } else {
        box.querySelector('.lp-img').style.display = 'none';
        box.hidden = false;
      }
    })
    .catch(function () { /* resta nascosto */ });
})();

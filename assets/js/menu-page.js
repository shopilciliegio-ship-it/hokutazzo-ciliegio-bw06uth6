// Pagina "Menù del ristorante": menù speciali + menù della settimana (JPG del Ciliegio-Menu su GitHub)
(function () {
  'use strict';
  var root = document.getElementById('menu-app');
  if (!root) return;
  var lang = document.documentElement.lang === 'en' ? 'en' : 'it';
  var BASE = 'https://raw.githubusercontent.com/shopilciliegio-ship-it/Ciliegio-Menu/main/immagini-sito/';
  var T = {
    it: { days: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'],
          short: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
          months: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
          lunch: 'Pranzo', dinner: 'Cena', today: 'Oggi', week: 'Settimana dal', to: 'al',
          fail: 'Non riusciamo a caricare questo menù. Chiamaci allo 0577 309055 o scrivici su WhatsApp.',
          zoom: 'tocca per ingrandire' },
    en: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          lunch: 'Lunch', dinner: 'Dinner', today: 'Today', week: 'Week from', to: 'to',
          fail: 'We cannot load this menu right now. Call us on +39 0577 309055 or write on WhatsApp.',
          zoom: 'tap to enlarge' }
  }[lang];
  var NAMES = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
  var NUM = [[2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15]]; // [pranzo, cena] per giorno
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function imgUrl(d, s) { // s: 0 pranzo, 1 cena
    var f = pad(NUM[d][s]) + '-' + NAMES[d] + '-' + (s ? 'cena' : 'pranzo') + (lang === 'en' ? '-en' : '') + '.jpg';
    return BASE + encodeURIComponent(f);
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  // ---- lightbox
  var lb = document.getElementById('lb'), lbImg = lb.querySelector('img'), lbList = [], lbCur = 0;
  function lbShow(i) { lbCur = (i + lbList.length) % lbList.length; lbImg.src = lbList[lbCur]; lb.classList.add('open'); }
  function lbHide() { lb.classList.remove('open'); lbImg.removeAttribute('src'); }
  lb.querySelector('.x').addEventListener('click', lbHide);
  lb.querySelector('.p').addEventListener('click', function () { lbShow(lbCur - 1); });
  lb.querySelector('.n').addEventListener('click', function () { lbShow(lbCur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lbHide(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') lbHide();
    if (e.key === 'ArrowLeft') lbShow(lbCur - 1);
    if (e.key === 'ArrowRight') lbShow(lbCur + 1);
  });
  function menuImg(src, alt, list, idx) {
    var b = el('button', 'menu-img'); b.type = 'button'; b.setAttribute('aria-label', alt + ' (' + T.zoom + ')');
    var im = el('img'); im.alt = alt; im.loading = 'lazy'; im.src = src; im.width = 650; im.height = 919;
    im.addEventListener('error', function () { b.replaceWith(el('p', 'note menu-fail', T.fail)); });
    b.appendChild(im);
    b.addEventListener('click', function () { lbList = list; lbShow(idx); });
    return b;
  }

  // ---- menù della settimana
  var now = new Date();
  var dow = (now.getDay() + 6) % 7; // 0 = lunedì
  var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
  function dayDate(i) { return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i); }
  function fmt(d) { return d.getDate() + ' ' + T.months[d.getMonth()]; }

  var weekBox = document.getElementById('menu-week');
  if (weekBox) {
    var sel = dow, svc = (now.getHours() >= 16) ? 1 : 0; // dopo le 16 propone la cena
    var chips = el('div', 'daybar'); chips.setAttribute('role', 'tablist');
    var title = el('p', 'week-title', T.week + ' ' + fmt(dayDate(0)) + ' ' + T.to + ' ' + fmt(dayDate(6)));
    var seg = el('div', 'seg'); seg.setAttribute('role', 'tablist');
    var stage = el('div', 'menu-stage');
    var btns = [], sbtns = [];
    T.days.forEach(function (n, i) {
      var b = el('button', 'chip', '<b>' + T.short[i] + '</b><span>' + dayDate(i).getDate() + '</span>' + (i === dow ? '<i>' + T.today + '</i>' : ''));
      b.type = 'button'; b.setAttribute('role', 'tab');
      b.addEventListener('click', function () { sel = i; draw(); });
      chips.appendChild(b); btns.push(b);
    });
    [T.lunch, T.dinner].forEach(function (n, s) {
      var b = el('button', null, n); b.type = 'button'; b.setAttribute('role', 'tab');
      b.addEventListener('click', function () { svc = s; draw(); });
      seg.appendChild(b); sbtns.push(b);
    });
    var first = true;
    function draw() {
      btns.forEach(function (b, i) { b.setAttribute('aria-selected', i === sel ? 'true' : 'false'); });
      sbtns.forEach(function (b, i) { b.setAttribute('aria-selected', i === svc ? 'true' : 'false'); });
      stage.innerHTML = '';
      var list = [imgUrl(sel, 0), imgUrl(sel, 1)];
      [0, 1].forEach(function (s) {
        var fig = el('figure', 'menu-fig' + (s === svc ? ' on' : ''));
        fig.appendChild(el('figcaption', null, T.days[sel] + ' ' + dayDate(sel).getDate() + ' · ' + (s ? T.dinner : T.lunch)));
        fig.appendChild(menuImg(list[s], T.days[sel] + ' – ' + (s ? T.dinner : T.lunch), list, s));
        stage.appendChild(fig);
      });
      // centra il giorno scelto nella barra (solo scorrimento orizzontale, mai della pagina)
      var cur = btns[sel];
      chips.scrollTo({ left: cur.offsetLeft - (chips.clientWidth - cur.offsetWidth) / 2, behavior: first ? 'auto' : 'smooth' });
      first = false;
    }
    weekBox.appendChild(title); weekBox.appendChild(chips); weekBox.appendChild(seg); weekBox.appendChild(stage);
    draw();
  }

  // ---- menù speciali (da assets/data/menu-speciali.json)
  var spBox = document.getElementById('menu-special');
  if (spBox) {
    var hideSpecial = function () { var sec = document.getElementById('sec-special'); if (sec) sec.hidden = true; };
    fetch('/hokutazzo-ciliegio-bw06uth6/assets/data/menu-speciali.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (j) {
      var today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
      var items = (j.menu || []).filter(function (m) { return !m.fino_al || m.fino_al >= today; });
      if (!items.length) { hideSpecial(); return; }
      var list = items.map(function (m) { return (m.img[lang] || m.img.it); });
      items.forEach(function (m, i) {
        var card = el('figure', 'sp-card');
        var t = m.titolo[lang] || m.titolo.it;
        card.appendChild(menuImg(list[i], t, list, i));
        card.appendChild(el('figcaption', null, '<b>' + t + '</b><span>' + (m.data[lang] || m.data.it) + '</span>'));
        spBox.appendChild(card);
      });
    }).catch(hideSpecial);
  }
})();

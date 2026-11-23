// Il Ciliegio – sito 2027 (bozza v0.2)
(function () {
  'use strict';

  // Header: trasparente sulla foto, bianco dopo lo scroll
  var header = document.getElementById('header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu mobile
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && header) header.classList.add('scrolled');
      else onScroll();
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        onScroll();
      }
    });
  }

  // Carosello "Idee per la tua visita"
  var rail = document.getElementById('rail');
  document.querySelectorAll('.rail-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!rail) return;
      var dir = btn.classList.contains('next') ? 1 : -1;
      rail.scrollBy({ left: dir * 366, behavior: 'smooth' });
    });
  });


  // Galleria: filtri e lightbox
  var gal = document.getElementById('gal');
  if (gal) {
    var items = Array.prototype.slice.call(gal.querySelectorAll('button'));
    var filters = document.getElementById('filters');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var f = b.getAttribute('data-f');
      filters.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      items.forEach(function (it) { it.hidden = !(f === 'tutte' || it.getAttribute('data-c') === f); });
    });
    var lb = document.getElementById('lb'), img = lb.querySelector('img'), cur = 0;
    function visible() { return items.filter(function (i) { return !i.hidden; }); }
    function show(i) { var v = visible(); if (!v.length) return; cur = (i + v.length) % v.length; img.src = v[cur].querySelector('img').src; lb.classList.add('open'); }
    gal.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(visible().indexOf(b)); });
    lb.querySelector('.x').addEventListener('click', function () { lb.classList.remove('open'); });
    lb.querySelector('.p').addEventListener('click', function () { show(cur - 1); });
    lb.querySelector('.n').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('open'); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lb.classList.remove('open');
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  // Anno nel footer
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

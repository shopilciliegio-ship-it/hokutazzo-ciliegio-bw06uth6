/* Componi il tuo menù — Il Ciliegio (a passi)
   1) scegli il menù di partenza (menu a tendina)  2) cambia i piatti  3) quando e in quanti -> invia.
   Legge /assets/data/menu-builder.json (estratto da Ciliegio Menu: solo piatti e proposte).
   Il supplemento dei piatti entra nel prezzo ma non viene mai mostrato.
   La richiesta parte da WhatsApp o email (la casella richieste arriva in fase 2). */
(function () {
  var root = document.getElementById('mb');
  if (!root) return;
  var L = root.getAttribute('data-lang') === 'en' ? 'en' : 'it';
  var T = {
    it: {
      port: { antipasto: 'Antipasto', primo: 'Primo', secondo: 'Secondo', contorno: 'Contorno', dolce: 'Dolce' },
      st: ['Il menù da cui partire', 'I tuoi piatti', 'Quando e in quanti'],
      pick: 'Scegli un menù di partenza…', inside: 'Cosa trovi', pp: 'a persona',
      hint2: 'Cambia i piatti che preferisci: il prezzo si aggiorna da solo.',
      flex: 'Questa è una base di partenza: i piatti si possono cambiare, aggiungere o togliere parlandone direttamente con noi. Qui vedi tutti i nostri piatti: quelli fuori stagione li adattiamo insieme a te con la cucina. Se vorresti un piatto che qui non trovi (per esempio un risotto diverso da quelli in elenco), scrivilo nel riquadro qui sotto e lo valutiamo insieme.',
      addK: { antipasto: 'Aggiungi un altro piatto', primo: 'Aggiungi un altro primo', secondo: 'Aggiungi un altro secondo', contorno: 'Aggiungi un altro contorno' }, mixedH: 'Gli antipasti misti (Antipasto del Ciliegio, Antipasto misto toscano, Gran tagliere) vanno da soli. Da 1 a 6 piatti il prezzo è lo stesso.',
      wish: 'Altri piatti o modifiche che vorresti (facoltativo)', add: 'Aggiungi un altro piatto', rem: 'Togli', bring: 'Lo porta il cliente', bringP: 'Lo porta il cliente (− € 3 a persona)', dolceH: 'Un solo dolce. Se lo portate voi il prezzo scende di € 3 a persona.',
      ok2: 'Ok, il menù va bene', back: 'Cambia menù di partenza',
      tot: 'Totale indicativo', pers: 'persone', persSing: 'persona',
      note: 'Prezzo indicativo: lo confermiamo noi dopo la tua richiesta.',
      date: 'Data', serv: 'Servizio', lunch: 'Pranzo', dinner: 'Cena', people: 'Quante persone', name: 'Nome e cognome',
      contact: 'Telefono o email', notes: 'Intolleranze, allergie o richieste', notesH: 'Le verifichiamo noi con te: non sono una conferma automatica.',
      wa: 'Invia su WhatsApp', mail: 'Invia per email', yours: 'Il tuo menù',
      err: 'Mancano alcuni dati: ', errF: { date: 'data', people: 'numero di persone', name: 'nome', contact: 'telefono o email' },
      loadErr: 'Non riusciamo a caricare i piatti in questo momento. Scrivici su WhatsApp o chiamaci: ti prepariamo noi il menù.',
      msgHead: 'Richiesta menù dal sito', menuL: 'Menù', waNum: '393291767348', subj: 'Richiesta menù dal sito'
    },
    en: {
      port: { antipasto: 'Starter', primo: 'First course', secondo: 'Main course', contorno: 'Side dish', dolce: 'Dessert' },
      st: ['Your starting menu', 'Your dishes', 'When and how many'],
      pick: 'Choose a starting menu…', inside: 'What you get', pp: 'per person',
      hint2: 'Change the dishes you prefer: the price updates by itself.',
      flex: 'This is a starting point: dishes can be changed, added or removed after talking to us directly. You see all our dishes here: out-of-season ones are adapted together with you and the kitchen. If you would like a dish you cannot find here (for example a different risotto), write it in the box below and we will look at it together.',
      addK: { antipasto: 'Add another dish', primo: 'Add another first course', secondo: 'Add another main course', contorno: 'Add another side dish' }, mixedH: 'Mixed starters (Antipasto del Ciliegio, Antipasto misto toscano, Gran tagliere) are served on their own. From 1 to 6 dishes the price is the same.',
      wish: 'Other dishes or changes you would like (optional)', add: 'Add another dish', rem: 'Remove', bring: 'Brought by the client', bringP: 'Brought by the client (− € 3 per person)', dolceH: 'One dessert only. If you bring your own the price drops by € 3 per person.',
      ok2: 'Great, the menu is fine', back: 'Change starting menu',
      tot: 'Indicative total', pers: 'people', persSing: 'person',
      note: 'Indicative price: we confirm it after your request.',
      date: 'Date', serv: 'Service', lunch: 'Lunch', dinner: 'Dinner', people: 'How many people', name: 'Full name',
      contact: 'Phone or email', notes: 'Intolerances, allergies or requests', notesH: 'We will check them with you: this is not an automatic confirmation.',
      wa: 'Send on WhatsApp', mail: 'Send by email', yours: 'Your menu',
      err: 'Some details are missing: ', errF: { date: 'date', people: 'number of people', name: 'name', contact: 'phone or email' },
      loadErr: 'We cannot load the dishes right now. Write to us on WhatsApp or call: we will prepare the menu for you.',
      msgHead: 'Menu request from the website', menuL: 'Menu', waNum: '393291767348', subj: 'Menu request from the website'
    }
  }[L];
  var ORDER = ['antipasto', 'primo', 'secondo', 'contorno', 'dolce'];
  var MAXS = { antipasto: 6, primo: 2, secondo: 2, contorno: 2, dolce: 1 };
  var D, sel = null, f = {}, steps = [];

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function dish(id) { var p = D.piatti[id]; return L === 'en' ? p.e : p.n; }
  function sortedPool(k) { return D.pool[k].slice().sort(function (a, b) { return dish(a).localeCompare(dish(b), L); }); }
  function eur(n) { return '€ ' + (Math.round(n * 100) / 100).toString().replace('.', ','); }
  function prop(id) { for (var i = 0; i < D.proposte.length; i++) if (D.proposte[i].id === id) return D.proposte[i]; }

  function perPerson() {
    var p = prop(sel.id), v = p.prezzo;
    ORDER.forEach(function (k) {
      (sel.piatti[k] || []).forEach(function (id) { if (id) v += D.piatti[id].x || 0; });
      (p.piatti[k] || []).forEach(function (id) { v -= D.piatti[id].x || 0; });
      var rate = D.piuPiatto[k];
      if (rate) v += rate * (Math.max(0, count(sel.piatti[k]) - 1) - Math.max(0, (p.piatti[k] || []).length - 1));
    });
    if (!count(sel.piatti.dolce) && count(p.piatti.dolce)) v += D.senzaDolce;
    return v;
  }
  function count(a) { return (a || []).filter(function (x) { return x; }).length; }
  function isMisto(id) { return D.misti.indexOf(id) > -1; }
  function persons() { var n = f.people ? parseInt(f.people.value, 10) : 0; return n > 0 ? n : 0; }

  /* ---------- struttura a passi ---------- */
  function makeStep(i) {
    var s = el('section', 'mb-step'), h = el('div', 'mb-sh');
    h.appendChild(el('span', 'mb-n', String(i + 1))); h.appendChild(el('h2', '', T.st[i]));
    s.appendChild(h); var body = el('div', 'mb-body'); s.appendChild(body);
    s.hidden = i > 0; steps.push(s); root.appendChild(s); return body;
  }
  function reveal(i) {
    steps[i].hidden = false;
    setTimeout(function () { steps[i].scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
  }

  /* ---------- passo 1: menu a tendina ---------- */
  var b1, b2, b3, preview, dishesBox, bar;
  function buildStep1() {
    var wrap = el('div', 'mb-selwrap');
    var s = document.createElement('select'); s.id = 'mb-start'; s.className = 'mb-select mb-select--big';
    s.setAttribute('aria-label', T.st[0]);
    var o0 = el('option', '', T.pick); o0.value = ''; o0.disabled = true; o0.selected = true; s.appendChild(o0);
    D.proposte.forEach(function (p) {
      var o = el('option', '', p.nome[L] + ' — ' + eur(p.prezzo) + ' ' + T.pp); o.value = p.id; s.appendChild(o);
    });
    wrap.appendChild(s); b1.appendChild(wrap);
    preview = el('div', 'mb-prev'); preview.hidden = true; b1.appendChild(preview);
    s.onchange = function () { choose(s.value); };
  }

  function choose(id) {
    var p = prop(id), first = steps[1].hidden;
    sel = { id: id, piatti: {} };
    ORDER.forEach(function (k) { sel.piatti[k] = (p.piatti[k] || []).slice(); });
    steps[2].hidden = true;
    preview.hidden = false; preview.innerHTML = '';
    preview.appendChild(el('p', 'mb-pd', p.desc[L]));
    drawDishes(); drawBar();
    if (first) reveal(1);
  }

  /* ---------- passo 2: piatti ---------- */
  function buildStep2() {
    b2.appendChild(el('p', 'mb-hint', T.hint2));
    dishesBox = el('div', 'mb-dishes'); b2.appendChild(dishesBox);
    b2.appendChild(el('p', 'mb-flex', T.flex));
    var wf = el('div', 'mb-f'), wl = el('label', '', T.wish); wl.setAttribute('for', 'mb-wish');
    var wt = document.createElement('textarea'); wt.id = 'mb-wish'; wt.rows = 3; f.wish = wt; wf.appendChild(wl); wf.appendChild(wt); b2.appendChild(wf);
    bar = el('div', 'mb-bar'); b2.appendChild(bar);
    var act = el('div', 'mb-act');
    var ok = el('button', 'btn btn-primary', T.ok2 + ' →'); ok.type = 'button';
    ok.onclick = function () { drawRecap(); var first = steps[2].hidden; steps[2].hidden = false; if (first) reveal(2); else steps[2].scrollIntoView({ behavior: 'smooth' }); };
    act.appendChild(ok); b2.appendChild(act);
  }

  function redraw() { drawDishes(); drawBar(); drawRecap(); }
  function drawDishes() {
    dishesBox.innerHTML = '';
    ORDER.forEach(function (k) {
      var slots = sel.piatti[k] || [], grp = el('div', 'mb-dish');
      grp.appendChild(el('span', 'mb-dl', T.port[k]));
      if (k === 'dolce') grp.appendChild(el('small', 'mb-dh', T.dolceH));
      if (k === 'antipasto') grp.appendChild(el('small', 'mb-dh', T.mixedH));
      slots.forEach(function (cur, i) {
        var line = el('div', 'mb-line');
        var s = document.createElement('select'); s.className = 'mb-select'; s.id = 'mb-' + k + '-' + i;
        s.setAttribute('aria-label', T.port[k] + (slots.length > 1 ? ' ' + (i + 1) : ''));
        if (k === 'dolce') { var ob = el('option', '', T.bringP); ob.value = ''; if (!cur) ob.selected = true; s.appendChild(ob); }
        var others = slots.filter(function (_, j) { return j !== i; });
        sortedPool(k).forEach(function (id) {
          if (others.indexOf(id) > -1) return;
          if (k === 'antipasto' && slots.length > 1 && isMisto(id)) return;
          var o = el('option', '', dish(id)); o.value = id; if (id === cur) o.selected = true; s.appendChild(o);
        });
        s.onchange = function () { sel.piatti[k][i] = s.value; redraw(); };
        line.appendChild(s);
        if (slots.length > 1) {
          var x = el('button', 'mb-x', '×'); x.type = 'button'; x.setAttribute('aria-label', T.rem);
          x.onclick = function () { sel.piatti[k].splice(i, 1); redraw(); }; line.appendChild(x);
        }
        grp.appendChild(line);
      });
      var mixed = k === 'antipasto' && slots.some(isMisto);
      if (slots.length < MAXS[k] && !mixed) {
        var rate = D.piuPiatto[k], lab = T.addK[k] + (rate ? ' (+ ' + eur(rate) + ' ' + T.pp + ')' : '');
        var ad = el('button', 'mb-add', '+ ' + lab); ad.type = 'button';
        ad.onclick = function () {
          var used = sel.piatti[k], pick = sortedPool(k).filter(function (id) { return used.indexOf(id) < 0 && !(k === 'antipasto' && isMisto(id)); }).sort(function (x, y) { return (D.piatti[x].x || 0) - (D.piatti[y].x || 0); })[0];
          if (pick) { sel.piatti[k].push(pick); redraw(); }
        };
        grp.appendChild(ad);
      }
      dishesBox.appendChild(grp);
    });
  }

  function drawBar() {
    bar.innerHTML = '';
    bar.appendChild(el('span', 'mb-bp', eur(perPerson())));
    bar.appendChild(el('span', 'mb-bl', T.pp));
  }

  /* ---------- passo 3: quando e quanti + invio ---------- */
  function field(id, label, type, extra, hint) {
    var w = el('div', 'mb-f'), l = el('label', '', label); l.setAttribute('for', 'mb-' + id);
    var i = type === 'textarea' ? document.createElement('textarea') : document.createElement(type === 'select' ? 'select' : 'input');
    i.id = 'mb-' + id; if (type !== 'select' && type !== 'textarea') i.type = type; else if (type === 'select') i.className = 'mb-select';
    if (extra) Object.keys(extra).forEach(function (k) { i.setAttribute(k, extra[k]); });
    if (type === 'textarea') i.rows = 3;
    w.appendChild(l); w.appendChild(i); if (hint) w.appendChild(el('small', '', hint)); f[id] = i; return w;
  }
  var recap, elErr;
  function buildStep3() {
    var today = new Date().toISOString().slice(0, 10);
    recap = el('div', 'mb-recap'); b3.appendChild(recap);
    var g = el('div', 'mb-form');
    g.appendChild(field('date', T.date, 'date', { min: today }));
    var fs = field('serv', T.serv, 'select');
    [['pranzo', T.lunch], ['cena', T.dinner]].forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; f.serv.appendChild(op); });
    g.appendChild(fs);
    g.appendChild(field('people', T.people, 'number', { min: 1, max: 300, inputmode: 'numeric', placeholder: '0' }));
    g.appendChild(field('name', T.name, 'text', { autocomplete: 'name' }));
    g.appendChild(field('contact', T.contact, 'text', { autocomplete: 'off' }));
    var nw = field('notes', T.notes, 'textarea', null, T.notesH); nw.className += ' wide'; g.appendChild(nw);
    b3.appendChild(g);
    f.people.oninput = drawRecap;
    var act = el('div', 'mb-act');
    var w = el('button', 'btn btn-primary', T.wa); w.type = 'button'; w.onclick = function () { send('wa'); };
    var m = el('button', 'btn btn-ghost', T.mail); m.type = 'button'; m.onclick = function () { send('mail'); };
    act.appendChild(w); act.appendChild(m); b3.appendChild(act);
    elErr = el('p', 'mb-err'); elErr.hidden = true; elErr.setAttribute('role', 'alert'); b3.appendChild(elErr);
  }

  function drawRecap() {
    if (!recap || !sel) return;
    var p = prop(sel.id), pp = perPerson(), n = persons();
    recap.innerHTML = '';
    recap.appendChild(el('h3', '', T.yours + ': ' + p.nome[L]));
    var ul = el('ul', 'mb-list');
    ORDER.forEach(function (k) { (sel.piatti[k] || []).forEach(function (id) {
      var li = el('li'); li.appendChild(el('b', '', T.port[k] + ' ')); li.appendChild(document.createTextNode(id ? dish(id) : T.bring)); ul.appendChild(li); }); });
    recap.appendChild(ul);
    var line = el('div', 'mb-tline'); line.appendChild(el('span', 'mb-bp', eur(pp))); line.appendChild(el('span', 'mb-bl', T.pp));
    recap.appendChild(line);
    if (n) recap.appendChild(el('div', 'mb-tot', T.tot + ' · ' + n + ' ' + (n === 1 ? T.persSing : T.pers) + ': ' + eur(pp * n)));
    recap.appendChild(el('div', 'mb-note', T.note));
  }

  function message() {
    var p = prop(sel.id), pp = perPerson(), n = persons(), lines = [T.msgHead, ''];
    lines.push(T.date + ': ' + f.date.value + ' (' + (f.serv.value === 'cena' ? T.dinner : T.lunch) + ')');
    lines.push(T.people + ': ' + n);
    lines.push(T.name + ': ' + f.name.value.trim());
    lines.push(T.contact + ': ' + f.contact.value.trim());
    lines.push('', T.menuL + ': ' + p.nome[L] + ' (' + eur(pp) + ' ' + T.pp + ' — ' + eur(pp * n) + ')');
    ORDER.forEach(function (k) { (sel.piatti[k] || []).forEach(function (id) { lines.push('- ' + T.port[k] + ': ' + (id ? dish(id) : T.bring)); }); });
    if (f.wish.value.trim()) lines.push('', T.wish.replace(' (facoltativo)', '').replace(' (optional)', '') + ': ' + f.wish.value.trim());
    if (f.notes.value.trim()) lines.push('', T.notes + ': ' + f.notes.value.trim());
    return lines.join('\n');
  }
  function missing() {
    var m = [];
    if (!f.date.value) m.push(T.errF.date);
    if (!persons()) m.push(T.errF.people);
    if (!f.name.value.trim()) m.push(T.errF.name);
    if (!f.contact.value.trim()) m.push(T.errF.contact);
    return m;
  }
  function send(kind) {
    var m = missing();
    if (m.length) { elErr.textContent = T.err + m.join(', '); elErr.hidden = false; return; }
    elErr.hidden = true;
    var txt = message();
    if (kind === 'wa') window.open('https://wa.me/' + T.waNum + '?text=' + encodeURIComponent(txt), '_blank', 'noopener');
    else window.location.href = 'mailto:agriturismo@ilciliegio.com?subject=' + encodeURIComponent(T.subj) + '&body=' + encodeURIComponent(txt);
  }

  function build() {
    root.innerHTML = '';
    b1 = makeStep(0); b2 = makeStep(1); b3 = makeStep(2);
    buildStep1(); buildStep2(); buildStep3();
  }

  fetch('/hokutazzo-ciliegio-bw06uth6/assets/data/menu-builder.json').then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (j) { D = j; build(); })
    .catch(function () { root.innerHTML = ''; root.appendChild(el('p', 'mb-err', T.loadErr)); });
})();

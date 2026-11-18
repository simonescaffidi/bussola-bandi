(function () {
  var form = document.getElementById('sim-form');
  if (!form) return;
  var slug = form.getAttribute('data-slug'), out = document.getElementById('sim-out'), hid = document.getElementById('sim-hidden');
  var eur = function (n) { return '€ ' + Math.round(n).toLocaleString('it-IT'); };
  function interessi(importo, tassoAnnuo) { // ammortamento francese, 5 anni, rate semestrali
    var r = tassoAnnuo / 100 / 2, n = 10, rata = importo * r / (1 - Math.pow(1 + r, -n));
    return rata * n - importo;
  }
  var calc = {
    'nuova-sabatini': function (v) {
      var t = parseFloat(v.linea);
      return { valore: interessi(v.importo, t), dettaglio: 'Tasso convenzionale ' + String(t).replace('.', ',') + '% su ' + eur(v.importo) + ', 5 anni.' };
    },
    'resto-al-sud': function (v) { return avvio(v, 40000, 50000, 0.75, 0.70); },
    'autoimpiego-centro-nord': function (v) { return avvio(v, 30000, 40000, 0.65, 0.60); },
    'zes-unica': function (v) {
      var tab = { a: { p: 60, m: 50, g: 40 }, b: { p: 50, m: 40, g: 30 }, c: { p: 35, m: 25, g: 15 } };
      var al = tab[v.regione][v.dimensione], teorico = v.importo * al / 100;
      return { valore: teorico, dettaglio: 'Aliquota ' + al + '%. Con un riparto come quello del 2025 (60,3811%) il credito utilizzabile sarebbe circa ' + eur(teorico * 0.603811) + '.' };
    }
  };
  function avvio(v, vBase, vInnov, p1, p2) {
    if (v.modo === 'voucher') {
      var tetto = v.innovativo ? vInnov : vBase;
      return { valore: Math.min(v.importo, tetto), dettaglio: 'Voucher fino a ' + eur(tetto) + '.' };
    }
    var p = v.importo <= 120000 ? p1 : p2;
    return { valore: Math.min(v.importo, 200000) * p, dettaglio: 'Contributo a fondo perduto del ' + Math.round(p * 100) + '% su ' + eur(Math.min(v.importo, 200000)) + '.' };
  }
  function leggi() {
    var v = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      v[el.name] = el.type === 'checkbox' ? el.checked : (el.type === 'number' ? parseFloat(el.value) : el.value);
    });
    return v;
  }
  function aggiorna() {
    var v = leggi(), imp = form.elements.importo;
    if (!(v.importo >= parseFloat(imp.min) && v.importo <= parseFloat(imp.max))) {
      out.innerHTML = '<p class="sim-err">Inserisci un importo tra ' + eur(imp.min) + ' e ' + eur(imp.max) + '.</p>';
      if (hid) hid.value = '';
      return;
    }
    var r = calc[slug](v);
    out.innerHTML = '<div class="sim-val">' + eur(r.valore) + '</div><p>' + r.dettaglio + '</p>';
    if (hid) hid.value = 'Simulatore ' + slug + ': importo ' + eur(v.importo) + ', stima ' + eur(r.valore) + '. ' + r.dettaglio;
  }
  form.addEventListener('input', aggiorna);
  form.addEventListener('submit', function (e) { e.preventDefault(); aggiorna(); });
  aggiorna();
})();

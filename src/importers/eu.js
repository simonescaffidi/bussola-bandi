// Import dei bandi UE a gestione diretta dal Funding & Tenders Portal (API di ricerca pubblica del portale).
const { upsertBando, isoDate } = require('../bandi-store');
const db = require('../db');

const API = 'https://api.tech.ec.europa.eu/search-api/prod/rest/search?apiKey=SEDIA&text=***';
const QUERY = { bool: { must: [{ terms: { type: ['1'] } }, { terms: { status: ['31094501', '31094502'] } }] } };
const strip = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

async function pagina(n) {
  const fd = new FormData();
  fd.append('query', new Blob([JSON.stringify(QUERY)], { type: 'application/json' }), 'q.json');
  fd.append('languages', new Blob(['["en"]'], { type: 'application/json' }), 'l.json');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  const res = await fetch(`${API}&pageSize=100&pageNumber=${n}`, { method: 'POST', body: fd, signal: ctrl.signal });
  clearTimeout(timer);
  if (!res.ok) throw new Error('EU API HTTP ' + res.status);
  return res.json();
}

function settore(t) {
  t = t.toLowerCase();
  if (/digital|cyber|artificial intelligence|data |cloud|quantum/.test(t)) return 'digitale';
  if (/climate|environment|energy|circular|biodivers|life-|waste|green/.test(t)) return 'ambiente';
  if (/agri|rural|food|fisher/.test(t)) return 'rurale';
  if (/culture|creative|media|sport/.test(t)) return 'cultura-sport';
  if (/erasmus|skills|education|training|employment/.test(t)) return 'lavoro-formazione';
  if (/citizens|cerv|civil society|social/.test(t)) return 'terzo-settore';
  return 'ricerca-innovazione';
}

async function importa() {
  const oggi = new Date().toISOString().slice(0, 10);
  const visti = new Set(), nuovi = [];
  let totale = 0;
  for (let n = 1; n <= 20; n++) {
    const d = await pagina(n);
    const res = d.results || [];
    for (const r of res) {
      const m = r.metadata || {};
      const g = (k) => (Array.isArray(m[k]) ? m[k][0] : m[k]) || '';
      const ident = g('identifier');
      if (!ident || visti.has(ident)) continue;
      visti.add(ident);
      const scad = isoDate(g('deadlineDate'));
      if (scad && scad < oggi) continue;
      const titolo = strip(g('title')) || strip(r.summary);
      const call = strip(g('callTitle'));
      const budget = parseFloat(g('budget'));
      const b = {
        id: 'eu-' + ident.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 110),
        title_it: titolo.slice(0, 300), title_en: titolo.slice(0, 300),
        ente: 'Commissione Europea', livello: 'europeo', tipo: 'entrambi', regione: 'Europeo', provincia: '',
        settore: settore(ident + ' ' + titolo + ' ' + call),
        categoria_it: 'Bando UE a gestione diretta', categoria_en: 'EU direct-management call',
        scadenza: scad || 'variabile', data_apertura: isoDate(g('startDate')), data_chiusura: scad,
        importo_it: budget > 0 ? 'Dotazione € ' + Math.round(budget).toLocaleString('it-IT') : 'Vedi bando',
        importo_en: budget > 0 ? 'Budget € ' + Math.round(budget).toLocaleString('en-GB') : 'See call',
        sintesi_it: (call ? call + '. ' : '') + strip(g('description')).slice(0, 480),
        link: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/' + encodeURIComponent(ident),
        fonte: 'EU Funding & Tenders Portal', origine: 'eu', forma: 'Contributo/Fondo perduto',
        beneficiari: g('status') === '31094501' ? 'In arrivo (non ancora aperto)' : ''
      };
      if (!b.title_it) continue;
      if (await upsertBando(b)) nuovi.push(b);
      totale++;
    }
    if (res.length < 100) break;
  }
  if (totale < 50) throw new Error('EU API: solo ' + totale + ' bandi letti, risultato anomalo');
  const ids = [...visti].map(i => 'eu-' + i.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 110));
  const chiusi = await db.query(`UPDATE bandi SET attivo=false WHERE origine='eu' AND attivo=true AND NOT (id = ANY($1))`, [ids]);
  return { aperti: totale, nuovi, disattivati: chiusi.rowCount };
}

module.exports = { importa };

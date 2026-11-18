// Import dell'open data "Incentivi Italia" (incentivitalia.gov.it, licenza CC BY 4.0).
const { upsertBando, isoDate } = require('../bandi-store');
const db = require('../db');

const URL_DATI = 'https://www.incentivitalia.gov.it/open-data/incentivi/OpenData_Incentivi.json';
const UA = 'Mozilla/5.0 (compatible; BussolaBandi/1.0; +https://www.simonescaffidi.it)';
const CHUNK = 4 * 1024 * 1024;

// Il server chiude spesso la connessione a metà file: si scarica a blocchi con header Range e ripresa.
async function scarica() {
  const parti = [];
  let offset = 0, totale = null, errori = 0;
  while (totale === null || offset < totale) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 60000);
      const res = await fetch(URL_DATI, { headers: { Range: `bytes=${offset}-${offset + CHUNK - 1}`, 'User-Agent': UA }, signal: ctrl.signal });
      if (res.status !== 206 && res.status !== 200) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      clearTimeout(timer);
      if (res.status === 200) return buf; // il server ha ignorato Range e mandato tutto
      const cr = res.headers.get('content-range') || '';
      const m = cr.match(/\/(\d+)$/);
      if (m) totale = parseInt(m[1], 10);
      if (!buf.length) throw new Error('blocco vuoto');
      parti.push(buf);
      offset += buf.length;
      errori = 0;
    } catch (e) {
      if (++errori > 6) throw new Error('Download Incentivi Italia fallito: ' + e.message + (e.cause ? ' (' + (e.cause.code || e.cause.message) + ')' : ''));
      await new Promise(r => setTimeout(r, 2000 * errori));
    }
  }
  return Buffer.concat(parti);
}

const REGIONI = { 'Trentino-Alto Adige/Südtirol': 'Trentino-Alto Adige', "Valle d'Aosta/Vallée d'Aoste": "Valle d'Aosta" };
const ent = (s) => String(s || '').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const euro = (n) => '€ ' + Math.round(n).toLocaleString('it-IT');

function settore(x) {
  const t = (x.Titolo || '').toLowerCase();
  const ob = (x.Obiettivo_Finalita || []).join(' ').toLowerCase();
  const sa = x.Settore_Attivita || [];
  if (/digital|voucher pid|e-commerce|cybersecur|intelligenza artificiale/.test(t)) return 'digitale';
  if (/rifiut|ambient|energ|fotovoltaic|circolare|sostenibil|green|clima/.test(t)) return 'ambiente';
  if (/internazionalizz|fier[ae]|export|estero/.test(t)) return 'internazionalizzazione';
  if (/turis|ricettiv|alberg/.test(t)) return 'turismo';
  if (/agricol|rural|pesca|zootecn|forest|vitivinic/.test(t)) return 'rurale';
  if (/formazione|tirocin|occupazion|assunzion|lavorator|alternanza|orientamento/.test(t)) return 'lavoro-formazione';
  if (/cultur|sport|spettacol|cinema|editoria/.test(t)) return 'cultura-sport';
  if (/terzo settore|non profit|volontariat|associazion/.test(t)) return 'terzo-settore';
  if (/ricerca|innovazione|brevett|startup|start-up/.test(t)) return 'ricerca-innovazione';
  if (sa.length && sa.length <= 2 && /agricoltura/i.test(sa.join(' '))) return 'rurale';
  if (sa.length === 1 && /turismo|alberghiero/i.test(sa[0])) return 'turismo';
  if (ob === 'digitalizzazione') return 'digitale';
  if (ob === 'internazionalizzazione') return 'internazionalizzazione';
  if (ob === 'transizione ecologica') return 'ambiente';
  if (ob === 'innovazione e ricerca') return 'ricerca-innovazione';
  if (/formazione/.test(ob) && !/,/.test(ob)) return 'lavoro-formazione';
  return 'generale';
}

function mappa(x) {
  const regioni = (x.Regioni || []).filter(r => r && r !== 'Estero').map(r => REGIONI[r] || r);
  const regione = regioni.length === 1 ? regioni[0] : (regioni.length >= 18 || regioni.length === 0 ? 'Nazionale' : 'Multiregionale');
  const sogg = x.Tipologia_Soggetto || [];
  const cittadino = sogg.includes('Cittadino');
  const altri = sogg.some(s => s !== 'Cittadino');
  const max = x.Agevolazione_Concedibile_Max, stanz = x.Stanziamento_incentivo;
  const importo = [max > 0 ? 'Agevolazione fino a ' + euro(max) : '', stanz > 0 ? 'dotazione ' + euro(stanz) : ''].filter(Boolean).join(' · ') || 'Vedi bando';
  const desc = ent(x.Descrizione).replace(/^Cos'è\s*/i, '').replace(/\s+/g, ' ').trim();
  const forma = (x.Forma_agevolazione || []).join(', ');
  const chiusura = isoDate(x.Data_chiusura);
  return {
    id: 'ii-' + x.ID_Incentivo,
    title_it: ent(x.Titolo).replace(/\s+/g, ' ').trim().slice(0, 300),
    ente: ent(x.Soggetto_Concedente || x.Amministrazione_responsabile).trim(),
    livello: regione === 'Nazionale' ? 'nazionale' : 'regionale',
    tipo: cittadino ? (altri ? 'entrambi' : 'cittadino') : 'impresa',
    regione, provincia: '',
    settore: settore(x),
    categoria_it: forma, categoria_en: forma,
    scadenza: chiusura || 'a sportello',
    data_apertura: isoDate(x.Data_apertura), data_chiusura: chiusura,
    importo_it: importo,
    sintesi_it: desc.length > 600 ? desc.slice(0, 597) + '…' : desc,
    link: x.Link_istituzionale || 'https://www.incentivitalia.gov.it/',
    fonte: 'Incentivi Italia (open data, CC BY 4.0)',
    origine: 'incentivitalia',
    beneficiari: sogg.join(', '), forma
  };
}

function aperto(x, oggi) {
  if (x.Incentivo_attivato !== 'SI' || !x.Titolo) return false;
  const ch = isoDate(x.Data_chiusura);
  if (ch) return ch >= oggi;
  const anno = parseInt(oggi.slice(0, 4), 10);
  if (x.Anno_chiusura) return parseInt(x.Anno_chiusura, 10) >= anno;
  const ap = isoDate(x.Data_apertura);
  return !!ap && ap >= (anno - 2) + '-01-01'; // senza scadenza: tenuti solo se aperti negli ultimi due anni
}

async function importa(datiGiaScaricati) {
  const raw = datiGiaScaricati || JSON.parse((await scarica()).toString('utf8'));
  if (!Array.isArray(raw) || raw.length < 500) throw new Error('Dataset Incentivi Italia inatteso (' + (Array.isArray(raw) ? raw.length : typeof raw) + ' righe)');
  const oggi = new Date().toISOString().slice(0, 10);
  const aperti = raw.filter(x => aperto(x, oggi)).map(mappa).filter(b => b.title_it && b.link);
  const nuovi = [];
  for (const b of aperti) { if (await upsertBando(b)) nuovi.push(b); }
  const ids = aperti.map(b => b.id);
  const chiusi = await db.query(`UPDATE bandi SET attivo=false WHERE origine='incentivitalia' AND attivo=true AND NOT (id = ANY($1))`, [ids]);
  // Scoperta di nuove fonti: ogni ente con un incentivo aperto il cui sito non è ancora nel registro viene aggiunto.
  let fontiNuove = 0;
  try {
    const { rows } = await db.query(`SELECT url, url_bandi FROM fonti`);
    const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };
    const noti = new Set(rows.flatMap(r => [host(r.url), host(r.url_bandi)]).filter(Boolean));
    for (const b of aperti) {
      const h = host(b.link);
      if (!h || noti.has(h) || /incentivitalia\.gov\.it$/.test(h)) continue;
      noti.add(h);
      const origine = new URL(b.link).origin + '/';
      const r = await db.query(
        `INSERT INTO fonti (chiave, nome, gruppo, regione, url, url_bandi, verificato, note) VALUES ($1,$2,'Altri enti erogatori',$3,$4,$4,false,'Aggiunta in automatico: ente con incentivi nel catalogo Incentivi Italia.') ON CONFLICT (chiave) DO NOTHING`,
        [h + '|auto', b.ente.slice(0, 200) || h, ['Nazionale', 'Multiregionale'].includes(b.regione) ? '' : b.regione, origine]);
      fontiNuove += r.rowCount;
    }
  } catch (e) { console.error('Scoperta fonti:', e.message); }
  return { totale_dataset: raw.length, aperti: aperti.length, nuovi, disattivati: chiusi.rowCount, fonti_nuove: fontiNuove };
}

module.exports = { importa, scarica };

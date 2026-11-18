// API protette da chiave (header x-api-key): usate dal task pianificato e per la manutenzione.
const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendAlert } = require('../alert');
const { upsertBando } = require('../bandi-store');
const { notificaNuovi } = require('../notify');
const { eseguiTutti } = require('../importers');

function requireApiKey(req, res, next) {
  const key = req.get('x-api-key');
  if (!key || !process.env.INGEST_API_KEY || key !== process.env.INGEST_API_KEY) return res.status(401).json({ error: 'unauthorized' });
  next();
}
router.use(requireApiKey);
const json = express.json({ limit: '5mb' });

// Inserimento/aggiornamento di bandi trovati dall'agente giornaliero.
router.post('/ingest', json, async (req, res) => {
  try {
    const { bandi, segnalazione_id } = req.body || {};
    if (!Array.isArray(bandi)) return res.status(400).json({ error: 'bandi deve essere un array' });
    const nuovi = [], scartati = [];
    for (const b of bandi) {
      if (!b || !b.id || !b.title_it || !/^https?:\/\//.test(b.link || '')) { scartati.push(b && b.id); continue; }
      b.origine = b.origine || 'agente';
      if (await upsertBando(b)) nuovi.push(b);
    }
    if (segnalazione_id) await db.query(`UPDATE segnalazioni SET stato='convertita' WHERE id=$1`, [segnalazione_id]);
    const email = await notificaNuovi(nuovi);
    res.json({ ok: true, totale: bandi.length, nuovi: nuovi.length, scartati, email_inviate: email });
  } catch (e) {
    console.error(e);
    await sendAlert('POST /api/ingest', e);
    res.status(500).json({ error: 'errore interno' });
  }
});

// Avvio manuale degli importatori automatici (?solo=incentivitalia,eu,rss). Risponde subito, il lavoro prosegue in background.
router.post('/import', (req, res) => {
  const solo = String(req.query.solo || '').split(',').filter(Boolean);
  eseguiTutti(solo).then(r => console.log('Import completato', JSON.stringify(r))).catch(e => console.error(e));
  res.json({ ok: true, avviato: true });
});

router.get('/import/stato', async (req, res) => {
  const log = await db.query('SELECT importer, ok, dettagli, created_at FROM import_log ORDER BY id DESC LIMIT 12');
  const tot = await db.query(`SELECT origine, count(*)::int AS n FROM bandi WHERE attivo GROUP BY origine ORDER BY n DESC`);
  const fonti = await db.query(`SELECT gruppo, count(*)::int AS n, count(*) FILTER (WHERE monitor_status='ok')::int AS lette, count(*) FILTER (WHERE changed_at IS NOT NULL AND (last_checked_at IS NULL OR changed_at > last_checked_at))::int AS cambiate FROM fonti GROUP BY gruppo ORDER BY n DESC`);
  const segn = await db.query(`SELECT stato, count(*)::int AS n FROM segnalazioni GROUP BY stato`);
  res.json({ bandi_attivi: tot.rows, fonti: fonti.rows, segnalazioni: segn.rows, log: log.rows });
});

// Verifica di raggiungibilità di un sito dal server (per capire quali fonti bloccano il cloud).
router.get('/probe', async (req, res) => {
  const urls = [].concat(req.query.url || []).slice(0, 12);
  const out = [];
  for (const u of urls) {
    const t0 = Date.now();
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BussolaBandi/1.0)', Range: 'bytes=0-2000' }, signal: ctrl.signal });
      const body = await r.text();
      clearTimeout(timer);
      out.push({ url: u, status: r.status, ms: Date.now() - t0, bytes: body.length });
    } catch (e) {
      out.push({ url: u, errore: e.name === 'AbortError' ? 'timeout' : e.message + (e.cause ? ' (' + (e.cause.code || e.cause.message) + ')' : ''), ms: Date.now() - t0 });
    }
  }
  res.json(out);
});

// Fonti da leggere: prima quelle la cui pagina è cambiata dall'ultimo controllo dell'agente, poi le meno recenti.
router.get('/fonti/da-controllare', async (req, res) => {
  const n = Math.min(parseInt(req.query.n, 10) || 40, 100);
  const gruppo = req.query.gruppo || null;
  const { rows } = await db.query(
    `SELECT id, nome, gruppo, area, regione, url_bandi, note,
            (changed_at IS NOT NULL AND (last_checked_at IS NULL OR changed_at > last_checked_at)) AS cambiata
     FROM fonti
     WHERE url_bandi <> '' AND ($2::text IS NULL OR gruppo = $2)
     ORDER BY (changed_at IS NOT NULL AND (last_checked_at IS NULL OR changed_at > last_checked_at)) DESC,
              (gruppo = 'Altri enti erogatori') ASC, last_checked_at ASC NULLS FIRST, id LIMIT $1`, [n, gruppo]);
  await db.query('UPDATE fonti SET last_checked_at = now() WHERE id = ANY($1)', [rows.map(r => r.id)]);
  res.json(rows);
});

// Aggiunta di una nuova fonte al registro (scoperta dall'agente).
router.post('/fonti', json, async (req, res) => {
  const f = req.body || {};
  if (!f.nome || !/^https?:\/\//.test(f.url_bandi || '')) return res.status(400).json({ error: 'nome e url_bandi obbligatori' });
  const gruppi = ['Nazionali ed europee', 'Regioni e fondi UE regionali', 'Finanziarie e agenzie regionali', 'Camere di Commercio', 'GAL', 'FLAG (pesca)', 'Fonti tematiche', 'Altri enti erogatori'];
  const chiave = String(f.url_bandi).toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '') + '|' + String(f.nome).toLowerCase().slice(0, 60);
  const r = await db.query(
    `INSERT INTO fonti (chiave, nome, gruppo, area, regione, url, url_bandi, feed, verificato, note) VALUES ($1,$2,$3,$4,$5,$6,$6,$7,true,$8) ON CONFLICT (chiave) DO NOTHING RETURNING id`,
    [chiave, f.nome, gruppi.includes(f.gruppo) ? f.gruppo : 'Altri enti erogatori', f.area || '', f.regione || '', f.url_bandi, f.feed || '', f.note || 'Aggiunta dall\'agente']);
  res.json({ ok: true, aggiunta: r.rowCount === 1 });
});

// Scheda completa di un bando (requisiti, spese, procedura, FAQ) e messa in evidenza.
router.post('/bandi/:id/dettagli', json, async (req, res) => {
  const d = req.body || {};
  const r = await db.query(`UPDATE bandi SET dettagli = $2, in_evidenza = COALESCE($3, in_evidenza) WHERE id = $1`, [req.params.id, JSON.stringify(d.dettagli || {}), typeof d.in_evidenza === 'boolean' ? d.in_evidenza : null]);
  res.json({ ok: true, aggiornati: r.rowCount });
});

// Richieste di assistenza arrivate dal sito.
router.get('/richieste', async (req, res) => {
  const { rows } = await db.query(`SELECT * FROM richieste ORDER BY id DESC LIMIT 200`);
  res.json(rows);
});

// Segnalazioni (avvisi/decreti/notizie dai feed) ancora da trasformare in schede bando.
router.get('/segnalazioni', async (req, res) => {
  const n = Math.min(parseInt(req.query.n, 10) || 40, 100);
  const { rows } = await db.query(`SELECT id, fonte_nome, regione, titolo, link, estratto, pubblicato FROM segnalazioni WHERE stato='nuova' ORDER BY pubblicato DESC NULLS LAST, id DESC LIMIT $1`, [n]);
  res.json(rows);
});
router.post('/segnalazioni/:id', json, async (req, res) => {
  const stato = ['convertita', 'scartata', 'nuova'].includes((req.body || {}).stato) ? req.body.stato : 'scartata';
  await db.query('UPDATE segnalazioni SET stato=$2 WHERE id=$1', [req.params.id, stato]);
  res.json({ ok: true });
});

// Elenco compatto dei bandi attivi, per evitare duplicati.
router.get('/bandi', async (req, res) => {
  const { rows } = await db.query(`SELECT id, title_it, ente, regione, data_chiusura, origine FROM bandi WHERE attivo AND ($1::text IS NULL OR regione = $1) ORDER BY updated_at DESC LIMIT 2000`, [req.query.regione || null]);
  res.json(rows);
});

module.exports = router;

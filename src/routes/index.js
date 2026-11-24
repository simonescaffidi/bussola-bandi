const express = require('express');
const router = express.Router();
const db = require('../db');
const { t } = require('../i18n');
const { STATO_SQL, STATI } = require('../stato');
const { PROVINCE } = require('../province');

const PER_PAGINA = 30;
const REGIONI = ['Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche', 'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana', 'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto'];

router.get('/', async (req, res, next) => {
  try {
    const lang = res.locals.lang;
    const f = {
      q: String(req.query.q || '').trim().slice(0, 80),
      target: ['cittadino', 'impresa'].includes(req.query.target) ? req.query.target : '',
      regione: String(req.query.regione || '').slice(0, 40),
      provincia: String(req.query.provincia || '').slice(0, 40),
      settore: String(req.query.settore || '').slice(0, 40),
      livello: ['europeo', 'nazionale', 'regionale'].includes(req.query.livello) ? req.query.livello : '',
      stato: STATI.includes(req.query.stato) ? req.query.stato : '',
      naz: req.query.naz === '0' ? '0' : '1'
    };
    const where = ['attivo = true'], p = [];
    if (f.q) { p.push('%' + f.q + '%'); where.push(`(title_it ILIKE $${p.length} OR ente ILIKE $${p.length} OR sintesi_it ILIKE $${p.length})`); }
    if (f.target) { p.push(f.target); where.push(`(tipo = $${p.length} OR tipo = 'entrambi')`); }
    if (f.regione) {
      p.push(f.regione);
      where.push(f.naz === '1' ? `(regione = $${p.length} OR regione IN ('Nazionale','Multiregionale'))` : `regione = $${p.length}`);
    }
    if (f.provincia && !(PROVINCE[f.regione] || []).includes(f.provincia)) f.provincia = '';
    if (f.provincia) { p.push(f.provincia); where.push(`(provincia = $${p.length} OR provincia = '')`); }
    if (f.settore) { p.push(f.settore); where.push(`settore = $${p.length}`); }
    if (f.livello) { p.push(f.livello); where.push(`livello = $${p.length}`); }
    if (f.stato) { p.push(f.stato); where.push(`(${STATO_SQL}) = $${p.length}`); }
    const w = where.join(' AND ');
    const pagina = Math.max(parseInt(req.query.p, 10) || 1, 1);
    const tot = (await db.query(`SELECT count(*)::int AS n FROM bandi WHERE ${w}`, p)).rows[0].n;
    // Prima i bandi della regione scelta, poi per scadenza più vicina; quelli senza data in fondo.
    const ord = (f.provincia ? `(provincia = $${p.indexOf(f.provincia) + 1}) DESC, ` : '') + (f.regione ? `(regione = $${p.indexOf(f.regione) + 1}) DESC, ` : '');
    const { rows } = await db.query(
      `SELECT *, ${STATO_SQL} AS stato FROM bandi WHERE ${w} ORDER BY ${ord} in_evidenza DESC, data_chiusura ASC NULLS LAST, updated_at DESC LIMIT ${PER_PAGINA} OFFSET ${(pagina - 1) * PER_PAGINA}`, p);
    const settori = (await db.query(`SELECT settore, count(*)::int AS n FROM bandi WHERE attivo GROUP BY settore ORDER BY settore`)).rows;
    const province = PROVINCE[f.regione] || [];
    const stat = (await db.query(`SELECT count(*)::int AS n, max(updated_at) AS agg FROM bandi WHERE attivo`)).rows[0];
    const nFonti = (await db.query(`SELECT count(*)::int AS n FROM fonti`)).rows[0].n;
    const qs = new URLSearchParams(Object.entries(f).filter(([k, v]) => v && !(k === 'naz' && v === '1'))).toString();
    res.render('index', { t: (k) => t(lang, k), lang, bandi: rows, f, regioni: REGIONI, settori, province, tot, pagina, pagine: Math.max(Math.ceil(tot / PER_PAGINA), 1), qs, stat, nFonti, stati: STATI });
  } catch (e) { next(e); }
});

router.get('/canali', async (req, res, next) => {
  try {
    const lang = res.locals.lang;
    const { rows } = await db.query(`SELECT nome, gruppo, regione, url_bandi, feed, verificato FROM fonti ORDER BY gruppo, regione, nome`);
    const ordine = ['Nazionali ed europee', 'Regioni e fondi UE regionali', 'Finanziarie e agenzie regionali', 'Camere di Commercio', 'GAL', 'FLAG (pesca)', 'Fonti tematiche', 'Altri enti erogatori'];
    const gruppi = ordine.map(g => ({ nome: g, fonti: rows.filter(r => r.gruppo === g) })).filter(g => g.fonti.length);
    res.render('canali', { t: (k) => t(lang, k), lang, gruppi, totale: rows.length });
  } catch (e) { next(e); }
});

router.get('/novita', async (req, res, next) => {
  try {
    const lang = res.locals.lang;
    const regione = String(req.query.regione || '').slice(0, 40);
    const { rows } = await db.query(
      `SELECT fonte_nome, regione, titolo, link, estratto, pubblicato FROM segnalazioni
       WHERE stato <> 'scartata' AND ($1 = '' OR regione = $1) ORDER BY pubblicato DESC NULLS LAST, id DESC LIMIT 150`, [regione]);
    res.render('novita', { t: (k) => t(lang, k), lang, voci: rows, regione, regioni: REGIONI });
  } catch (e) { next(e); }
});

router.get('/privacy', (req, res) => {
  const lang = res.locals.lang;
  res.render('privacy', { t: (k) => t(lang, k), lang });
});

module.exports = router;
module.exports.REGIONI = REGIONI;

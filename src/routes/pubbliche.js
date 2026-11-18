// Pagine pubbliche: scheda bando, scadenzario, simulatori, richiesta di assistenza, sitemap.
const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const router = express.Router();
const db = require('../db');
const { t } = require('../i18n');
const { STATO_SQL } = require('../stato');
const { sendMail } = require('../mailer');
const { sendAlert } = require('../alert');
const SIMULATORI = require('../data/simulatori');
const { REGIONI } = require('./index');

const base = (req) => process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

router.get('/bando/:id', async (req, res, next) => {
  try {
    const lang = res.locals.lang;
    const { rows } = await db.query(`SELECT *, ${STATO_SQL} AS stato FROM bandi WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).render('messaggio', { t: (k) => t(lang, k), lang, titolo: t(lang, 'not_found') });
    const b = rows[0];
    const sim = SIMULATORI.find(s => s.slug === b.simulatore);
    res.render('bando', { t: (k) => t(lang, k), lang, b, sim, regioni: REGIONI, ok: req.query.ok, base: base(req) });
  } catch (e) { next(e); }
});

router.get('/scadenze', async (req, res, next) => {
  try {
    const lang = res.locals.lang;
    const regione = String(req.query.regione || '').slice(0, 40);
    const giorni = [30, 60, 90].includes(parseInt(req.query.giorni, 10)) ? parseInt(req.query.giorni, 10) : 30;
    const { rows } = await db.query(
      `SELECT id, title_it, title_en, ente, regione, data_chiusura, importo_it, importo_en FROM bandi
       WHERE attivo AND data_chiusura BETWEEN CURRENT_DATE AND CURRENT_DATE + $2::int
         AND ($1 = '' OR regione = $1 OR regione IN ('Nazionale','Multiregionale'))
       ORDER BY data_chiusura, title_it LIMIT 600`, [regione, giorni]);
    const perGiorno = [];
    for (const r of rows) {
      const g = new Date(r.data_chiusura).toISOString().slice(0, 10);
      let ultimo = perGiorno[perGiorno.length - 1];
      if (!ultimo || ultimo.giorno !== g) { ultimo = { giorno: g, data: r.data_chiusura, bandi: [] }; perGiorno.push(ultimo); }
      ultimo.bandi.push(r);
    }
    res.render('scadenze', { t: (k) => t(lang, k), lang, perGiorno, totale: rows.length, regione, giorni, regioni: REGIONI });
  } catch (e) { next(e); }
});

router.get('/simulatori', async (req, res, next) => {
  try {
    const lang = res.locals.lang;
    res.render('simulatori', { t: (k) => t(lang, k), lang, simulatori: SIMULATORI });
  } catch (e) { next(e); }
});

router.get('/simulatori/:slug', async (req, res, next) => {
  try {
    const lang = res.locals.lang;
    const sim = SIMULATORI.find(s => s.slug === req.params.slug);
    if (!sim) return res.status(404).render('messaggio', { t: (k) => t(lang, k), lang, titolo: t(lang, 'not_found') });
    const { rows } = await db.query(`SELECT id, title_it, title_en, link FROM bandi WHERE id = $1`, [sim.bando_id]);
    res.render('simulatore', { t: (k) => t(lang, k), lang, sim, b: rows[0] || null, regioni: REGIONI, ok: req.query.ok });
  } catch (e) { next(e); }
});

const richiestaSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  telefono: z.string().trim().max(40).optional().default(''),
  azienda: z.string().trim().max(160).optional().default(''),
  regione: z.string().trim().max(40).optional().default(''),
  messaggio: z.string().trim().max(2000).optional().default(''),
  bando_id: z.string().trim().max(140).optional().default(''),
  origine: z.enum(['scheda', 'simulatore']).optional().default('scheda'),
  simulazione: z.string().trim().max(600).optional().default(''),
  consenso: z.literal('1'),
  ritorno: z.string().trim().max(200).optional().default('/')
});

router.post('/richiesta', rateLimit({ windowMs: 60 * 60 * 1000, max: 8 }), async (req, res) => {
  const lang = res.locals.lang;
  if (req.body && req.body.sito) return res.redirect('/'); // campo trappola anti-spam
  const p = richiestaSchema.safeParse(req.body);
  if (!p.success) return res.status(400).render('messaggio', { t: (k) => t(lang, k), lang, titolo: t(lang, 'lead_err') });
  const d = p.data;
  const ritorno = /^\/(bando|simulatori)\/[A-Za-z0-9_\-]+$/.test(d.ritorno) ? d.ritorno : '/';
  try {
    let titolo = '';
    if (d.bando_id) { const r = await db.query('SELECT title_it FROM bandi WHERE id=$1', [d.bando_id]); titolo = r.rows[0] ? r.rows[0].title_it : ''; }
    await db.query(`INSERT INTO richieste (nome,email,telefono,azienda,regione,messaggio,bando_id,bando_titolo,origine,simulazione) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [d.nome, d.email, d.telefono, d.azienda, d.regione, d.messaggio, d.bando_id, titolo, d.origine, d.simulazione]);
    // Notifica al gestore del sito: destinatario preso dalle variabili d'ambiente (LEADS_EMAIL, altrimenti ALERT_EMAIL).
    const dest = process.env.LEADS_EMAIL || process.env.ALERT_EMAIL;
    if (dest) {
      sendMail({ to: dest, subject: `[Bussola Bandi] Nuova richiesta di assistenza${titolo ? ': ' + titolo : ''}`,
        text: `Nome: ${d.nome}\nEmail: ${d.email}\nTelefono: ${d.telefono}\nAzienda: ${d.azienda}\nRegione: ${d.regione}\nBando: ${titolo} (${d.bando_id})\nOrigine: ${d.origine}\n${d.simulazione ? 'Simulazione: ' + d.simulazione + '\n' : ''}\nMessaggio:\n${d.messaggio}` })
        .catch(e => console.error('Notifica richiesta non inviata:', e.message));
    }
    res.redirect(ritorno + '?ok=1#assistenza');
  } catch (e) {
    console.error(e);
    sendAlert('POST /richiesta', e);
    res.status(500).render('messaggio', { t: (k) => t(lang, k), lang, titolo: t(lang, 'lead_err') });
  }
});

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${base(req)}/sitemap.xml\n`);
});

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const b = base(req);
    const { rows } = await db.query(`SELECT id, updated_at FROM bandi WHERE attivo ORDER BY updated_at DESC LIMIT 20000`);
    const fisse = ['/', '/scadenze', '/simulatori', '/novita', '/canali', '/newsletter', '/privacy'].concat(SIMULATORI.map(s => '/simulatori/' + s.slug));
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      fisse.map(u => `<url><loc>${b}${u}</loc></url>`).join('\n') + '\n' +
      rows.map(r => `<url><loc>${b}/bando/${encodeURIComponent(r.id)}</loc><lastmod>${new Date(r.updated_at).toISOString().slice(0, 10)}</lastmod></url>`).join('\n') + '\n</urlset>';
    res.type('application/xml').send(xml);
  } catch (e) { next(e); }
});

module.exports = router;

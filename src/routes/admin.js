// Area riservata del gestore: richieste di assistenza, iscritti, stato degli import.
// Accesso con ADMIN_EMAIL e ADMIN_PASSWORD (variabili d'ambiente); senza ADMIN_PASSWORD l'area resta chiusa.
const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const db = require('../db');
const { t } = require('../i18n');

const uguali = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};
const vista = (res, nome, dati) => res.render(nome, Object.assign({ t: (k) => t('it', k), lang: 'it', noindex: true }, dati));

router.use((req, res, next) => { res.set('X-Robots-Tag', 'noindex, nofollow'); res.set('Cache-Control', 'no-store'); next(); });

router.get('/login', (req, res) => {
  if (req.session.admin) return res.redirect('/admin');
  req.session.csrf = req.session.csrf || crypto.randomBytes(18).toString('hex');
  vista(res, 'admin-login', { csrf: req.session.csrf, errore: req.query.e, attiva: !!process.env.ADMIN_PASSWORD });
});

router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), (req, res) => {
  const b = req.body || {};
  const ok = process.env.ADMIN_PASSWORD && b.csrf && b.csrf === req.session.csrf &&
    uguali(String(b.email || '').trim().toLowerCase(), String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()) &&
    uguali(b.password || '', process.env.ADMIN_PASSWORD);
  if (!ok) return res.redirect('/admin/login?e=1');
  req.session.regenerate(() => {
    req.session.admin = true;
    req.session.csrf = crypto.randomBytes(18).toString('hex');
    res.redirect('/admin');
  });
});

router.use((req, res, next) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  if (req.method === 'POST' && (!req.body || req.body.csrf !== req.session.csrf)) return res.status(403).send('Sessione scaduta: ricarica la pagina.');
  next();
});

router.post('/logout', (req, res) => req.session.destroy(() => res.redirect('/admin/login')));

router.get('/', async (req, res, next) => {
  try {
    const stato = ['nuova', 'contattata', 'chiusa'].includes(req.query.stato) ? req.query.stato : '';
    const richieste = (await db.query(`SELECT * FROM richieste WHERE ($1 = '' OR stato = $1) ORDER BY id DESC LIMIT 300`, [stato])).rows;
    const conteggi = (await db.query(`SELECT stato, count(*)::int AS n FROM richieste GROUP BY stato`)).rows;
    const bandi = (await db.query(`SELECT origine, count(*)::int AS n FROM bandi WHERE attivo GROUP BY origine ORDER BY n DESC`)).rows;
    const iscritti = (await db.query(`SELECT count(*) FILTER (WHERE confirmed)::int AS confermati, count(*)::int AS totali FROM subscribers`)).rows[0];
    const fonti = (await db.query(`SELECT count(*)::int AS n, count(*) FILTER (WHERE monitor_status = 'ok')::int AS lette FROM fonti`)).rows[0];
    const log = (await db.query(`SELECT importer, ok, dettagli, created_at FROM import_log ORDER BY id DESC LIMIT 8`)).rows;
    vista(res, 'admin', { csrf: req.session.csrf, richieste, conteggi, stato, bandi, iscritti, fonti, log, brevo: !!process.env.BREVO_API_KEY });
  } catch (e) { next(e); }
});

router.post('/richieste/:id', async (req, res, next) => {
  try {
    const b = req.body;
    if (b.azione === 'elimina') await db.query('DELETE FROM richieste WHERE id = $1', [req.params.id]);
    else await db.query(`UPDATE richieste SET stato = $2, note = $3, updated_at = now() WHERE id = $1`,
      [req.params.id, ['nuova', 'contattata', 'chiusa'].includes(b.stato) ? b.stato : 'nuova', String(b.note || '').slice(0, 2000)]);
    res.redirect('/admin' + (b.filtro ? '?stato=' + encodeURIComponent(b.filtro) : ''));
  } catch (e) { next(e); }
});

router.get('/iscritti', async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT email, target, regione, provincia, settore, confirmed, created_at FROM subscribers ORDER BY id DESC LIMIT 1000`);
    vista(res, 'admin-iscritti', { csrf: req.session.csrf, iscritti: rows });
  } catch (e) { next(e); }
});

module.exports = router;

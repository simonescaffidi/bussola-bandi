const express = require('express');
const router = express.Router();
const db = require('../db');
const { t } = require('../i18n');
const canali = require('../data/canali');

router.get('/', async (req, res, next) => {
  try {
    const lang = res.locals.lang;
    const { rows } = await db.query('SELECT * FROM bandi WHERE attivo = true ORDER BY updated_at DESC');
    const regioni = [...new Set(rows.map(b => b.regione))].sort();
    const settori = [...new Set(rows.map(b => b.settore))].sort();
    res.render('index', { t: (k) => t(lang, k), lang, bandi: rows, regioni, settori });
  } catch (e) { next(e); }
});

router.get('/canali', (req, res) => {
  const lang = res.locals.lang;
  const gruppi = [...new Set(canali.map(c => c.gruppo))];
  res.render('canali', { t: (k) => t(lang, k), lang, canali, gruppi });
});

router.get('/privacy', (req, res) => {
  const lang = res.locals.lang;
  res.render('privacy', { t: (k) => t(lang, k), lang });
});

module.exports = router;

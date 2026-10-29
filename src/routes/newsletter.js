const express = require('express');
const crypto = require('crypto');
const { z } = require('zod');
const router = express.Router();
const db = require('../db');
const { sendMail } = require('../mailer');
const { t } = require('../i18n');

const signupSchema = z.object({
  email: z.string().email(),
  target: z.enum(['tutti', 'cittadino', 'impresa']).default('tutti'),
  regione: z.string().max(60).optional().default(''),
  provincia: z.string().max(60).optional().default(''),
  settore: z.string().max(60).optional().default('')
});

router.get('/newsletter', (req, res) => {
  const lang = res.locals.lang;
  res.render('newsletter', { t: (k) => t(lang, k), lang, ok: req.query.ok, err: req.query.err });
});

router.post('/newsletter', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.redirect('/newsletter?err=1');
  const { email, target, regione, provincia, settore } = parsed.data;
  const confirmToken = crypto.randomBytes(24).toString('hex');
  const unsubToken = crypto.randomBytes(24).toString('hex');
  try {
    await db.query(
      `INSERT INTO subscribers (email, target, regione, provincia, settore, confirm_token, unsubscribe_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (email) DO UPDATE SET target=$2, regione=$3, provincia=$4, settore=$5, confirm_token=$6`,
      [email, target, regione, provincia, settore, confirmToken, unsubToken]
    );
    const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const confirmUrl = `${base}/newsletter/confirm?token=${confirmToken}`;
    await sendMail({
      to: email,
      subject: 'Conferma la tua iscrizione a Bussola Bandi',
      text: `Conferma la tua iscrizione cliccando questo link: ${confirmUrl}`,
      html: `<p>Conferma la tua iscrizione a Bussola Bandi cliccando qui: <a href="${confirmUrl}">${confirmUrl}</a></p>`
    });
    res.redirect('/newsletter?ok=1');
  } catch (e) {
    console.error(e);
    res.redirect('/newsletter?err=1');
  }
});

router.get('/newsletter/confirm', async (req, res) => {
  const lang = res.locals.lang;
  const { token } = req.query;
  if (!token) return res.redirect('/newsletter?err=1');
  const { rowCount } = await db.query(
    'UPDATE subscribers SET confirmed = true, confirm_token = NULL WHERE confirm_token = $1',
    [token]
  );
  res.render('confirmed', { t: (k) => t(lang, k), lang, success: rowCount > 0 });
});

router.get('/newsletter/unsubscribe', async (req, res) => {
  const lang = res.locals.lang;
  const { token } = req.query;
  if (token) await db.query('DELETE FROM subscribers WHERE unsubscribe_token = $1', [token]);
  res.render('unsubscribed', { t: (k) => t(lang, k), lang });
});

module.exports = router;

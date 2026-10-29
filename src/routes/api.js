// Endpoint di ingestione usato dal task pianificato Cowork per aggiornare i bandi
// e inviare le notifiche email ai iscritti i cui filtri corrispondono.
const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendMail } = require('../mailer');
const { sendAlert } = require('../alert');

function requireApiKey(req, res, next) {
  const key = req.get('x-api-key');
  if (!key || key !== process.env.INGEST_API_KEY) return res.status(401).json({ error: 'unauthorized' });
  next();
}

router.post('/ingest', requireApiKey, express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const { bandi } = req.body;
    if (!Array.isArray(bandi)) return res.status(400).json({ error: 'bandi deve essere un array' });
    const nuovi = [];
    for (const b of bandi) {
      const { rows: existing } = await db.query('SELECT id FROM bandi WHERE id = $1', [b.id]);
      await db.query(
        `INSERT INTO bandi (id,title_it,title_en,ente,livello,tipo,regione,provincia,settore,categoria_it,categoria_en,scadenza,importo_it,importo_en,sintesi_it,sintesi_en,link,fonte,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18, now())
         ON CONFLICT (id) DO UPDATE SET title_it=$2,title_en=$3,ente=$4,livello=$5,tipo=$6,regione=$7,provincia=$8,settore=$9,categoria_it=$10,categoria_en=$11,scadenza=$12,importo_it=$13,importo_en=$14,sintesi_it=$15,sintesi_en=$16,link=$17,fonte=$18,updated_at=now()`,
        [b.id, b.title_it, b.title_en, b.ente, b.livello, b.tipo, b.regione, b.provincia || '', b.settore || 'altro', b.categoria_it, b.categoria_en, b.scadenza, b.importo_it, b.importo_en, b.sintesi_it, b.sintesi_en, b.link, b.fonte || '']
      );
      if (existing.length === 0) nuovi.push(b);
    }

    let notificati = 0;
    if (nuovi.length) {
      const { rows: subs } = await db.query('SELECT * FROM subscribers WHERE confirmed = true');
      for (const bando of nuovi) {
        for (const s of subs) {
          const matchTarget = s.target === 'tutti' || bando.tipo === 'entrambi' || s.target === bando.tipo;
          const matchRegione = !s.regione || s.regione === bando.regione || bando.regione === 'Nazionale' || bando.regione === 'Europeo' || bando.regione === 'Multiregionale';
          const matchSettore = !s.settore || s.settore === bando.settore;
          if (matchTarget && matchRegione && matchSettore) {
            await sendMail({
              to: s.email,
              subject: `Nuovo bando: ${bando.title_it}`,
              text: `${bando.title_it}\n\n${bando.sintesi_it || ''}\n\nScadenza: ${bando.scadenza || 'variabile'}\nDettagli: ${bando.link}\n\nPer annullare l'iscrizione: ${process.env.BASE_URL}/newsletter/unsubscribe?token=${s.unsubscribe_token}`,
              html: `<h2>${bando.title_it}</h2><p>${bando.sintesi_it || ''}</p><p><strong>Scadenza:</strong> ${bando.scadenza || 'variabile'}</p><p><a href="${bando.link}">Vai al bando</a></p><hr><p style="font-size:12px;color:#888"><a href="${process.env.BASE_URL}/newsletter/unsubscribe?token=${s.unsubscribe_token}">Annulla iscrizione</a></p>`
            });
            await db.query('INSERT INTO email_log (subscriber_id, bando_id, tipo) VALUES ($1,$2,$3)', [s.id, bando.id, 'nuovo_bando']);
            notificati++;
          }
        }
      }
    }
    res.json({ ok: true, totale: bandi.length, nuovi: nuovi.length, email_inviate: notificati });
  } catch (e) {
    console.error(e);
    await sendAlert('POST /api/ingest', e);
    res.status(500).json({ error: 'errore interno' });
  }
});

router.post('/seed', requireApiKey, async (req, res) => {
  try {
    const seed = require('../data/seed-bandi');
    const { rows } = await db.query('SELECT count(*)::int AS n FROM bandi');
    if (rows[0].n > 0) return res.json({ ok: true, skipped: true, existing: rows[0].n });
    for (const b of seed) {
      await db.query(
        `INSERT INTO bandi (id,title_it,title_en,ente,livello,tipo,regione,provincia,settore,categoria_it,categoria_en,scadenza,importo_it,importo_en,sintesi_it,sintesi_en,link,fonte)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         ON CONFLICT (id) DO NOTHING`,
        [b.id,b.title_it,b.title_en,b.ente,b.livello,b.tipo,b.regione,b.provincia||'',b.settore,b.categoria_it,b.categoria_en,b.scadenza,b.importo_it,b.importo_en,b.sintesi_it,b.sintesi_en,b.link,b.fonte]
      );
    }
    res.json({ ok: true, inserted: seed.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'errore interno' });
  }
});

module.exports = router;

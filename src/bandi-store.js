// Scrittura centralizzata dei bandi: tutti gli importatori e l'endpoint /api/ingest passano da qui.
const db = require('./db');

const SETTORI = ['generale', 'digitale', 'ricerca-innovazione', 'ambiente', 'rurale', 'turismo', 'internazionalizzazione', 'lavoro-formazione', 'cultura-sport', 'terzo-settore', 'sicurezza-lavoro', 'altro'];

function isoDate(v) {
  if (!v) return null;
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

// Inserisce o aggiorna un bando. Ritorna true se è nuovo.
async function upsertBando(b) {
  const chiusura = isoDate(b.data_chiusura) || isoDate(b.scadenza);
  const r = await db.query(
    `INSERT INTO bandi (id,title_it,title_en,ente,livello,tipo,regione,provincia,settore,categoria_it,categoria_en,scadenza,importo_it,importo_en,sintesi_it,sintesi_en,link,fonte,origine,data_apertura,data_chiusura,beneficiari,forma,attivo,updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,true,now())
     ON CONFLICT (id) DO UPDATE SET title_it=$2,title_en=$3,ente=$4,livello=$5,tipo=$6,regione=$7,provincia=$8,settore=$9,categoria_it=$10,categoria_en=$11,scadenza=$12,importo_it=$13,importo_en=$14,sintesi_it=$15,sintesi_en=$16,link=$17,fonte=$18,origine=$19,data_apertura=$20,data_chiusura=$21,beneficiari=$22,forma=$23,attivo=true,updated_at=now()
     RETURNING (xmax = 0) AS nuovo`,
    [b.id, b.title_it, b.title_en || b.title_it, b.ente || '', b.livello || 'nazionale', b.tipo || 'impresa', b.regione || 'Nazionale', b.provincia || '',
     SETTORI.includes(b.settore) ? b.settore : 'altro', b.categoria_it || '', b.categoria_en || b.categoria_it || '', b.scadenza || chiusura || 'variabile',
     b.importo_it || '', b.importo_en || b.importo_it || '', b.sintesi_it || '', b.sintesi_en || b.sintesi_it || '', b.link, b.fonte || '',
     b.origine || 'manuale', isoDate(b.data_apertura), chiusura, b.beneficiari || '', b.forma || '']
  );
  return r.rows[0].nuovo;
}

// Disattiva i bandi con scadenza passata.
async function chiudiScaduti() {
  const r = await db.query(`UPDATE bandi SET attivo=false WHERE attivo=true AND data_chiusura IS NOT NULL AND data_chiusura < CURRENT_DATE`);
  return r.rowCount;
}

async function logImport(importer, ok, dettagli) {
  try { await db.query('INSERT INTO import_log (importer, ok, dettagli) VALUES ($1,$2,$3)', [importer, ok, String(dettagli).slice(0, 2000)]); } catch (e) { console.error(e.message); }
}

module.exports = { upsertBando, chiudiScaduti, logImport, SETTORI, isoDate };

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
    `INSERT INTO bandi (id,title_it,title_en,ente,livello,tipo,regione,provincia,settore,categoria_it,categoria_en,scadenza,importo_it,importo_en,sintesi_it,sintesi_en,link,fonte,origine,data_apertura,data_chiusura,beneficiari,forma,attivo,tradotto,updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,true,$24,now())
     ON CONFLICT (id) DO UPDATE SET
       title_it=$2, ente=$4, livello=$5, tipo=$6, regione=$7,
       provincia = CASE WHEN $8 = '' AND $19 <> 'incentivitalia' THEN bandi.provincia ELSE $8 END,
       settore=$9, categoria_it=$10, scadenza=$12, importo_it=$13, sintesi_it=$15, link=$17, fonte=$18, origine=$19,
       data_apertura=$20, data_chiusura=$21, beneficiari=$22, forma=$23,
       -- le traduzioni già fatte si conservano finché il testo italiano non cambia
       title_en    = CASE WHEN NOT $24 AND bandi.tradotto AND bandi.title_it = $2 THEN bandi.title_en ELSE $3 END,
       sintesi_en  = CASE WHEN NOT $24 AND bandi.tradotto AND bandi.sintesi_it = $15 THEN bandi.sintesi_en ELSE $16 END,
       importo_en  = CASE WHEN NOT $24 AND bandi.tradotto AND bandi.importo_it = $13 THEN bandi.importo_en ELSE $14 END,
       categoria_en= CASE WHEN NOT $24 AND bandi.tradotto AND bandi.categoria_it = $10 THEN bandi.categoria_en ELSE $11 END,
       tradotto    = CASE WHEN $24 THEN true ELSE (bandi.tradotto AND bandi.title_it = $2 AND bandi.sintesi_it = $15) END,
       attivo = NOT bandi.escluso,
       updated_at = CASE WHEN bandi.title_it = $2 AND bandi.sintesi_it = $15 AND bandi.data_chiusura IS NOT DISTINCT FROM $21 AND bandi.importo_it = $13 THEN bandi.updated_at ELSE now() END
     RETURNING (xmax = 0) AS nuovo`,
    [b.id, b.title_it, b.title_en || b.title_it, b.ente || '', b.livello || 'nazionale', b.tipo || 'impresa', b.regione || 'Nazionale', b.provincia || '',
     SETTORI.includes(b.settore) ? b.settore : 'altro', b.categoria_it || '', b.categoria_en || b.categoria_it || '', b.scadenza || chiusura || 'variabile',
     b.importo_it || '', b.importo_en || b.importo_it || '', b.sintesi_it || '', b.sintesi_en || b.sintesi_it || '', b.link, b.fonte || '',
     b.origine || 'manuale', isoDate(b.data_apertura), chiusura, b.beneficiari || '', b.forma || '',
     // "ha già un testo inglese suo": vero per agente, manuale, UE; falso per l'open data, che arriva solo in italiano
     !!(b.sintesi_en && b.sintesi_en !== b.sintesi_it) || b.origine === 'eu']
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

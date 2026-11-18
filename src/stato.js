// Stato di un bando calcolato dalle date: aperto, in-scadenza (entro 14 giorni), in-arrivo, chiuso.
const STATO_SQL = `CASE WHEN NOT attivo THEN 'chiuso'
  WHEN data_apertura IS NOT NULL AND data_apertura > CURRENT_DATE THEN 'in-arrivo'
  WHEN data_chiusura IS NOT NULL AND data_chiusura <= CURRENT_DATE + 14 THEN 'in-scadenza'
  ELSE 'aperto' END`;
module.exports = { STATO_SQL, STATI: ['aperto', 'in-scadenza', 'in-arrivo'] };

// Esecuzione di tutti gli importatori automatici (ogni giorno, più avvio manuale da /api/import).
const { chiudiScaduti, logImport } = require('../bandi-store');
const { notificaNuovi } = require('../notify');
const { sendAlert } = require('../alert');

const IMPORTATORI = { incentivitalia: require('./incentivitalia'), eu: require('./eu'), rss: require('./rss'), monitor: require('./monitor') };
let inCorso = false;

async function eseguiTutti(quali) {
  if (inCorso) return { inCorso: true };
  inCorso = true;
  const esito = {};
  let nuovi = [];
  try {
    for (const nome of (quali && quali.length ? quali : Object.keys(IMPORTATORI))) {
      if (!IMPORTATORI[nome]) continue;
      try {
        const r = await IMPORTATORI[nome].importa();
        if (Array.isArray(r.nuovi)) { nuovi = nuovi.concat(r.nuovi); r.nuovi = r.nuovi.length; }
        esito[nome] = r;
        await logImport(nome, true, JSON.stringify(r));
      } catch (e) {
        esito[nome] = { errore: e.message };
        await logImport(nome, false, e.message);
        await sendAlert('Import automatico ' + nome, e);
      }
    }
    esito.scaduti_chiusi = await chiudiScaduti();
    // Al primo caricamento arrivano centinaia di bandi: niente raffica di email, solo dal giro successivo.
    esito.email_inviate = nuovi.length > 0 && nuovi.length <= 150 ? await notificaNuovi(nuovi) : 0;
  } finally { inCorso = false; }
  return esito;
}

// Pianificazione interna: un giro ogni giorno alle 05:30 (ora italiana) e uno 3 minuti dopo l'avvio se l'ultimo è più vecchio di 20 ore.
function pianifica() {
  const db = require('../db');
  setTimeout(async () => {
    try {
      const { rows } = await db.query(`SELECT max(created_at) AS t FROM import_log WHERE ok = true AND importer = 'incentivitalia'`);
      if (!rows[0].t || Date.now() - new Date(rows[0].t).getTime() > 20 * 3600 * 1000) await eseguiTutti();
    } catch (e) { console.error(e); }
  }, 3 * 60 * 1000);
  let ultimoGiorno = '';
  setInterval(() => {
    const ora = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Rome' }); // "2026-11-18 05:30:12"
    const giorno = ora.slice(0, 10), hhmm = ora.slice(11, 16);
    if (hhmm >= '05:30' && hhmm < '05:40' && giorno !== ultimoGiorno) { ultimoGiorno = giorno; eseguiTutti().catch(console.error); }
  }, 5 * 60 * 1000);
}

module.exports = { eseguiTutti, pianifica };

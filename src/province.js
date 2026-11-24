// Ricava la provincia di un bando dai comuni interessati o dal nome dell'ente (dati ISTAT, src/data/comuni-province.json).
const COMUNI = require('./data/comuni-province.json');
const PROVINCE = {};
for (const r of Object.keys(COMUNI)) PROVINCE[r] = [...new Set(Object.values(COMUNI[r]))].sort();

function provinciaDi(regione, comuni, ente) {
  const mappa = COMUNI[regione];
  if (!mappa) return '';
  const nomi = (comuni || []).flatMap(c => String(c).split(';')).map(s => s.trim().toLowerCase()).filter(Boolean);
  if (nomi.length && nomi.length <= 400) {
    const trovate = new Set(nomi.map(n => mappa[n]).filter(Boolean));
    if (trovate.size === 1) return [...trovate][0];
    if (trovate.size > 1) return '';
  }
  const e = String(ente || '');
  const m = e.match(/\bComune di\s+(.+)$/i);
  if (m && mappa[m[1].trim().toLowerCase()]) return mappa[m[1].trim().toLowerCase()];
  if (/camera di commercio|citt[aà] metropolitana|provincia di|libero consorzio/i.test(e)) {
    const dentro = PROVINCE[regione].filter(p => new RegExp('(^|[^a-zà-ú])' + p.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&') + '($|[^a-zà-ú])', 'i').test(e));
    if (dentro.length === 1) return dentro[0];
  }
  return '';
}

module.exports = { provinciaDi, PROVINCE };

// Carica/aggiorna il registro delle fonti (tabella fonti) dai file JSON in src/data/fonti.
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const dir = path.join(__dirname, 'data', 'fonti');
const load = (f) => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { return []; } };
const key = (u) => String(u || '').trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '');

function righe() {
  const out = [];
  for (const x of load('nazionali.json')) out.push({ nome: x.nome, gruppo: 'Nazionali ed europee', area: '', regione: x.regione || '', url: x.url_bandi, url_bandi: x.url_bandi, feed: x.feed || '', verificato: true, note: x.note || '' });
  for (const x of load('camere-commercio.json')) out.push({ nome: x.nome, gruppo: 'Camere di Commercio', area: '', regione: x.regione || '', url: x.sito || '', url_bandi: x.url_bandi || x.sito || '', feed: '', verificato: !!x.verificato, note: x.note || '' });
  for (const x of load('gal.json')) out.push({ nome: x.nome, gruppo: x.tipo === 'FLAG' ? 'FLAG (pesca)' : 'GAL', area: '', regione: x.regione || '', url: x.sito || '', url_bandi: x.url_bandi || x.sito || '', feed: '', verificato: !!x.verificato, note: '' });
  for (const x of load('regioni.json')) out.push({ nome: x.ente, gruppo: (x.tipo === 'finanziaria' || x.tipo === 'agenzia') ? 'Finanziarie e agenzie regionali' : 'Regioni e fondi UE regionali', area: x.tipo || '', regione: x.regione || '', url: x.url_bandi || '', url_bandi: x.url_bandi || '', feed: x.feed || '', verificato: !!x.verificato, note: x.note || '' });
  for (const x of load('tematici.json')) out.push({ nome: x.ente, gruppo: 'Fonti tematiche', area: x.area || '', regione: '', url: x.url_bandi || '', url_bandi: x.url_bandi || '', feed: x.feed || '', verificato: !!x.verificato, note: x.note || '' });
  return out.filter(r => r.nome && (r.url_bandi || r.url));
}

async function seedFonti() {
  const seen = new Set();
  let n = 0;
  for (const r of righe()) {
    const chiave = key(r.url_bandi || r.url) + '|' + r.nome.toLowerCase().slice(0, 60);
    if (seen.has(chiave)) continue;
    seen.add(chiave);
    await pool.query(
      `INSERT INTO fonti (chiave,nome,gruppo,area,regione,url,url_bandi,feed,verificato,note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (chiave) DO UPDATE SET nome=$2,gruppo=$3,area=$4,regione=$5,url=$6,url_bandi=$7,feed=$8,verificato=$9,note=$10`,
      [chiave, r.nome, r.gruppo, r.area, r.regione, r.url, r.url_bandi, r.feed, r.verificato, r.note]
    );
    n++;
  }
  return n;
}

module.exports = { seedFonti };

if (require.main === module) {
  seedFonti().then(n => { console.log('Fonti caricate:', n); return pool.end(); }).catch(e => { console.error(e); process.exit(1); });
}

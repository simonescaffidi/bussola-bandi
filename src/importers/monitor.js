// Controllo quotidiano di TUTTE le fonti del registro: scarica la pagina bandi di ognuna, ne ricava
// l'elenco dei link e ne calcola un'impronta. Se l'impronta cambia, la fonte viene segnata come
// "cambiata" e l'agente la legge per prima. Così ogni fonte è controllata ogni giorno senza costi.
const crypto = require('crypto');
const db = require('../db');

const UA = 'Mozilla/5.0 (compatible; BussolaBandi/1.0; +https://www.simonescaffidi.it)';
const PARALLELE = 8;

function impronta(html, base) {
  const voci = new Set();
  const re = /<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) && voci.size < 3000) {
    let href = m[1].trim();
    if (/^(javascript:|mailto:|tel:)/i.test(href)) continue;
    try { const u = new URL(href, base); href = u.origin + u.pathname; } catch (e) { continue; }
    const testo = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 120);
    if (testo.length < 4) continue;
    voci.add(testo + '|' + href);
  }
  if (voci.size < 3) return '';
  return crypto.createHash('sha1').update([...voci].sort().join('\n')).digest('hex');
}

async function controlla(f) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(f.url_bandi, { headers: { 'User-Agent': UA, Accept: 'text/html,*/*' }, signal: ctrl.signal, redirect: 'follow' });
    if (!res.ok) return { stato: 'HTTP ' + res.status };
    const html = (await res.text()).slice(0, 3000000);
    const h = impronta(html, f.url_bandi);
    if (!h) return { stato: 'pagina non leggibile (JavaScript o vuota)' };
    return { stato: 'ok', hash: h };
  } catch (e) {
    return { stato: e.name === 'AbortError' ? 'timeout' : 'non raggiungibile' + (e.cause && e.cause.code ? ' (' + e.cause.code + ')' : '') };
  } finally { clearTimeout(timer); }
}

async function importa() {
  const { rows: fonti } = await db.query(`SELECT id, url_bandi, hash FROM fonti WHERE url_bandi ~ '^https?://' ORDER BY id`);
  let ok = 0, ko = 0, cambiate = 0, i = 0;
  async function lavoratore() {
    while (i < fonti.length) {
      const f = fonti[i++];
      const r = await controlla(f);
      if (r.hash) {
        ok++;
        const cambiata = f.hash && f.hash !== r.hash;
        if (cambiata) cambiate++;
        await db.query(`UPDATE fonti SET hash=$2, monitor_at=now(), monitor_status='ok', changed_at = CASE WHEN $3 THEN now() ELSE changed_at END WHERE id=$1`, [f.id, r.hash, !!cambiata]);
      } else {
        ko++;
        await db.query(`UPDATE fonti SET monitor_at=now(), monitor_status=$2 WHERE id=$1`, [f.id, r.stato.slice(0, 120)]);
      }
    }
  }
  await Promise.all(Array.from({ length: PARALLELE }, lavoratore));
  return { fonti_controllate: fonti.length, lette: ok, non_lette: ko, cambiate };
}

module.exports = { importa, impronta };

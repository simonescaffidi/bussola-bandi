// Lettura dei feed RSS/Atom delle fonti: raccoglie avvisi, decreti e notizie che parlano di bandi
// e li salva come "segnalazioni" (pagina /novita), da cui vengono poi ricavate le schede complete.
const db = require('../db');

const UA = 'Mozilla/5.0 (compatible; BussolaBandi/1.0; +https://www.simonescaffidi.it)';
const SI = /\b(band[oi]|avvis[oi]|contribut[oi]|voucher|finanziament[oi]|agevolazion[ei]|incentiv[oi]|fondo perduto|manifestazion[ei] di interesse|graduatori[ae]|sovvenzion[ei]|ristor[oi]|misura|sportello|domande|decreto|call for proposals|bonus|credito d'imposta|prestit[oi])\b/i;
const NO = /\b(concors[oi] pubblic[oi]|selezione (del )?personale|gara d'appalto|procedura (aperta|negoziata)|esito di gara|aggiudicazione|convegno|webinar|seminario|comunicato stampa|rassegna stampa|cordoglio)\b/i;
const DEDICATO = /bandi|misure-aperte|avvisi|scadenze|notices|rc-procedure|incentivi/i;

const dec = (s) => String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const tag = (x, t) => { const m = x.match(new RegExp('<' + t + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + t + '>', 'i')); return m ? m[1] : ''; };

function parse(xml) {
  const out = [];
  const blocchi = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (const x of blocchi) {
    let link = dec(tag(x, 'link'));
    if (!link) { const m = x.match(/<link[^>]*href="([^"]+)"/i); link = m ? m[1] : ''; }
    const data = dec(tag(x, 'pubDate') || tag(x, 'published') || tag(x, 'updated') || tag(x, 'dc:date'));
    const d = data ? new Date(data) : null;
    out.push({
      titolo: dec(tag(x, 'title')).slice(0, 400), link: link.trim(),
      estratto: dec(tag(x, 'description') || tag(x, 'summary') || tag(x, 'content')).slice(0, 500),
      pubblicato: d && !isNaN(d) ? d : null
    });
  }
  return out;
}

async function leggi(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' }, signal: ctrl.signal, redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.text();
  } finally { clearTimeout(timer); }
}

async function importa() {
  const { rows: fonti } = await db.query(`SELECT id, nome, regione, feed FROM fonti WHERE feed <> '' ORDER BY id`);
  const limite = Date.now() - 90 * 24 * 3600 * 1000;
  const fatti = new Map();
  let nuove = 0, ok = 0, ko = 0;
  const errori = [];
  for (const f of fonti) {
    let stato = fatti.get(f.feed);
    if (!stato) {
      try {
        const items = parse(await leggi(f.feed));
        const dedicato = DEDICATO.test(f.feed);
        let n = 0;
        for (const it of items) {
          if (!it.titolo || !/^https?:\/\//.test(it.link)) continue;
          if (it.pubblicato && it.pubblicato.getTime() < limite) continue;
          const testo = it.titolo + ' ' + it.estratto;
          if (NO.test(it.titolo)) continue;
          if (!dedicato && !SI.test(testo)) continue;
          const r = await db.query(
            `INSERT INTO segnalazioni (fonte_id, fonte_nome, regione, titolo, link, estratto, pubblicato) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (link) DO NOTHING`,
            [f.id, f.nome, f.regione || '', it.titolo, it.link, it.estratto, it.pubblicato]);
          n += r.rowCount;
        }
        nuove += n; ok++;
        stato = `ok: ${items.length} voci, ${n} nuove`;
      } catch (e) {
        ko++;
        stato = 'errore: ' + (e.name === 'AbortError' ? 'timeout' : e.message + (e.cause ? ' (' + (e.cause.code || e.cause.message) + ')' : ''));
        errori.push(f.nome + ' → ' + stato);
      }
      fatti.set(f.feed, stato);
    }
    await db.query('UPDATE fonti SET last_feed_at = now(), last_feed_status = $2 WHERE id = $1', [f.id, stato.slice(0, 200)]);
  }
  return { feed_letti: ok, feed_in_errore: ko, nuove_segnalazioni: nuove, errori };
}

module.exports = { importa, parse };

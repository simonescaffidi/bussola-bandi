// Notifiche newsletter: una sola email riepilogativa per iscritto con i nuovi bandi che corrispondono ai suoi filtri.
const db = require('./db');
const { sendMail } = require('./mailer');

const esc = (s) => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MAX_PER_EMAIL = 25;

function corrisponde(s, b) {
  const t = s.target === 'tutti' || b.tipo === 'entrambi' || s.target === b.tipo;
  const r = !s.regione || s.regione === b.regione || ['Nazionale', 'Europeo', 'Multiregionale'].includes(b.regione);
  const p = !s.provincia || !b.provincia || s.provincia === b.provincia;
  const se = !s.settore || s.settore === b.settore;
  return t && r && p && se;
}

async function notificaNuovi(nuovi) {
  if (!nuovi.length || !process.env.BREVO_API_KEY) return 0;
  const base = process.env.BASE_URL || '';
  const { rows: subs } = await db.query('SELECT * FROM subscribers WHERE confirmed = true');
  let inviate = 0;
  for (const s of subs) {
    const match = nuovi.filter(b => corrisponde(s, b));
    if (!match.length) continue;
    const lista = match.slice(0, MAX_PER_EMAIL);
    const unsub = `${base}/newsletter/unsubscribe?token=${s.unsubscribe_token}`;
    const html = `<h2>Nuovi bandi in linea con i tuoi filtri</h2>` + lista.map(b =>
      `<p><strong><a href="${esc(b.link)}">${esc(b.title_it)}</a></strong><br>${esc(b.ente)} · ${esc(b.regione)} · scadenza: ${esc(b.data_chiusura || b.scadenza || 'variabile')}<br>${esc((b.sintesi_it || '').slice(0, 260))}</p>`).join('') +
      (match.length > lista.length ? `<p>…e altri ${match.length - lista.length} su <a href="${base}">Bussola Bandi</a>.</p>` : '') +
      `<hr><p style="font-size:12px;color:#888"><a href="${unsub}">Annulla iscrizione</a></p>`;
    const text = lista.map(b => `${b.title_it}\n${b.ente} - scadenza: ${b.data_chiusura || b.scadenza || 'variabile'}\n${b.link}`).join('\n\n') + `\n\nAnnulla iscrizione: ${unsub}`;
    try {
      await sendMail({ to: s.email, subject: match.length === 1 ? `Nuovo bando: ${match[0].title_it}` : `${match.length} nuovi bandi per te`, text, html });
      for (const b of lista) await db.query('INSERT INTO email_log (subscriber_id, bando_id, tipo) VALUES ($1,$2,$3)', [s.id, b.id, 'nuovo_bando']);
      inviate++;
    } catch (e) { console.error('Invio newsletter fallito:', e.message); }
  }
  return inviate;
}

module.exports = { notificaNuovi };

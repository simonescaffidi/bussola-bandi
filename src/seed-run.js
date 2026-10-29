// Esegue il seed iniziale dei bandi se la tabella è vuota (eseguito manualmente una tantum, non ad ogni deploy)
const { pool } = require('./db');
const seed = require('./data/seed-bandi');

async function run() {
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM bandi');
  if (rows[0].n > 0) { console.log('bandi già popolati, nessun seed necessario'); return pool.end(); }
  for (const b of seed) {
    await pool.query(
      `INSERT INTO bandi (id,title_it,title_en,ente,livello,tipo,regione,provincia,settore,categoria_it,categoria_en,scadenza,importo_it,importo_en,sintesi_it,sintesi_en,link,fonte)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT (id) DO NOTHING`,
      [b.id,b.title_it,b.title_en,b.ente,b.livello,b.tipo,b.regione,b.provincia||'',b.settore,b.categoria_it,b.categoria_en,b.scadenza,b.importo_it,b.importo_en,b.sintesi_it,b.sintesi_en,b.link,b.fonte]
    );
  }
  console.log('Seed completato:', seed.length, 'bandi');
  await pool.end();
}
run().catch(e => { console.error(e); process.exit(1); });

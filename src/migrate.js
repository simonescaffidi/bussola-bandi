const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function migrate() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  await pool.query('CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())');
  for (const file of files) {
    const { rows } = await pool.query('SELECT 1 FROM _migrations WHERE name=$1', [file]);
    if (rows.length) continue;
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log('Applico migrazione', file);
    await pool.query(sql);
    await pool.query('INSERT INTO _migrations(name) VALUES ($1)', [file]);
  }
  console.log('Migrazioni completate');
  await pool.end();
}
migrate().catch(e => { console.error(e); process.exit(1); });

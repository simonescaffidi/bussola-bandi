const { Pool } = require('pg');
const useSsl = /sslmode=require/.test(process.env.DATABASE_URL || '');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

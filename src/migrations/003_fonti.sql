ALTER TABLE bandi ADD COLUMN IF NOT EXISTS origine TEXT DEFAULT 'manuale';
ALTER TABLE bandi ADD COLUMN IF NOT EXISTS data_apertura DATE;
ALTER TABLE bandi ADD COLUMN IF NOT EXISTS data_chiusura DATE;
ALTER TABLE bandi ADD COLUMN IF NOT EXISTS beneficiari TEXT DEFAULT '';
ALTER TABLE bandi ADD COLUMN IF NOT EXISTS forma TEXT DEFAULT '';

CREATE TABLE IF NOT EXISTS fonti (
  id SERIAL PRIMARY KEY,
  chiave TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  gruppo TEXT NOT NULL,
  area TEXT DEFAULT '',
  regione TEXT DEFAULT '',
  url TEXT DEFAULT '',
  url_bandi TEXT DEFAULT '',
  feed TEXT DEFAULT '',
  verificato BOOLEAN DEFAULT false,
  note TEXT DEFAULT '',
  last_checked_at TIMESTAMPTZ,
  last_feed_at TIMESTAMPTZ,
  last_feed_status TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS segnalazioni (
  id SERIAL PRIMARY KEY,
  fonte_id INTEGER REFERENCES fonti(id) ON DELETE SET NULL,
  fonte_nome TEXT,
  regione TEXT DEFAULT '',
  titolo TEXT NOT NULL,
  link TEXT UNIQUE NOT NULL,
  estratto TEXT DEFAULT '',
  pubblicato TIMESTAMPTZ,
  stato TEXT DEFAULT 'nuova',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS import_log (
  id SERIAL PRIMARY KEY,
  importer TEXT NOT NULL,
  ok BOOLEAN NOT NULL,
  dettagli TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bandi_attivo ON bandi(attivo);
CREATE INDEX IF NOT EXISTS idx_bandi_chiusura ON bandi(data_chiusura);
CREATE INDEX IF NOT EXISTS idx_segnalazioni_pub ON segnalazioni(pubblicato DESC);
CREATE INDEX IF NOT EXISTS idx_fonti_checked ON fonti(last_checked_at);

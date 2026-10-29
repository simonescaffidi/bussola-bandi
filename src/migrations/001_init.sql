CREATE TABLE IF NOT EXISTS bandi (
  id TEXT PRIMARY KEY,
  title_it TEXT NOT NULL,
  title_en TEXT NOT NULL,
  ente TEXT NOT NULL,
  livello TEXT NOT NULL,
  tipo TEXT NOT NULL,
  regione TEXT NOT NULL,
  provincia TEXT DEFAULT '',
  settore TEXT DEFAULT 'altro',
  categoria_it TEXT,
  categoria_en TEXT,
  scadenza TEXT,
  importo_it TEXT,
  importo_en TEXT,
  sintesi_it TEXT,
  sintesi_en TEXT,
  link TEXT NOT NULL,
  fonte TEXT,
  attivo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  target TEXT DEFAULT 'tutti',
  regione TEXT DEFAULT '',
  provincia TEXT DEFAULT '',
  settore TEXT DEFAULT '',
  confirmed BOOLEAN DEFAULT false,
  confirm_token TEXT,
  unsubscribe_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_log (
  id SERIAL PRIMARY KEY,
  subscriber_id INTEGER REFERENCES subscribers(id) ON DELETE CASCADE,
  bando_id TEXT,
  tipo TEXT,
  sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bandi_regione ON bandi(regione);
CREATE INDEX IF NOT EXISTS idx_bandi_settore ON bandi(settore);
CREATE INDEX IF NOT EXISTS idx_subscribers_confirmed ON subscribers(confirmed);

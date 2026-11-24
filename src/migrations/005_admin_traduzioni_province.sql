ALTER TABLE bandi ADD COLUMN IF NOT EXISTS tradotto BOOLEAN DEFAULT false;
ALTER TABLE bandi ADD COLUMN IF NOT EXISTS escluso BOOLEAN DEFAULT false;
ALTER TABLE bandi ADD COLUMN IF NOT EXISTS motivo_esclusione TEXT DEFAULT '';
ALTER TABLE richieste ADD COLUMN IF NOT EXISTS note TEXT DEFAULT '';
ALTER TABLE richieste ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_bandi_provincia ON bandi(provincia);
-- I bandi inseriti dall'agente hanno già testo inglese proprio.
UPDATE bandi SET tradotto = true WHERE origine IN ('agente', 'manuale', 'eu');

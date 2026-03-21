-- ══════════════════════════════════════════════════════════════════════════
-- El Dude Tattoo — Supabase Setup
-- Cole este SQL no SQL Editor do seu projeto Supabase e execute.
-- https://supabase.com/dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════════════════

-- ── Tabelas ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS artists (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  bio         TEXT DEFAULT '',
  photo_url   TEXT NOT NULL DEFAULT '',
  specialties TEXT[] DEFAULT '{}',
  instagram   TEXT,
  whatsapp    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tattoos (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '',
  style       TEXT NOT NULL DEFAULT 'Realismo',
  price       TEXT,
  artist_id   TEXT REFERENCES artists(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'available',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchs (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price       TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '',
  link        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security (leitura e escrita públicas) ────────────────────────
-- O controle de acesso é feito pelo login do admin no frontend.

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tattoos ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchs  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all" ON artists;
DROP POLICY IF EXISTS "public_all" ON tattoos;
DROP POLICY IF EXISTS "public_all" ON merchs;

CREATE POLICY "public_all" ON artists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON tattoos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON merchs  FOR ALL USING (true) WITH CHECK (true);

-- ── Storage bucket para imagens ────────────────────────────────────────────
-- Execute separadamente se necessário:
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public read images"  ON storage.objects;
DROP POLICY IF EXISTS "public write images" ON storage.objects;

CREATE POLICY "public read images"  ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "public write images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');

-- ── Dados iniciais (artistas) ──────────────────────────────────────────────
-- Só insere se a tabela estiver vazia para não duplicar.

INSERT INTO artists (id, name, bio, photo_url, specialties, created_at)
SELECT id, name, bio, photo_url, specialties, created_at FROM (VALUES
  ('artist-1', 'Braian Otovicz',      '', '/braiansite.jpeg',   ARRAY[]::text[], '2025-01-01T00:00:00Z'),
  ('artist-2', 'Luiz Balestro',       '', '/luiisite.jpeg',     ARRAY[]::text[], '2025-01-02T00:00:00Z'),
  ('artist-3', 'Matheus de Oliveira', '', '/douglastatt.jpeg',  ARRAY[]::text[], '2025-01-03T00:00:00Z'),
  ('artist-4', 'Ana Biasi',           '', 'https://picsum.photos/seed/ana-biasi/400/400', ARRAY[]::text[], '2025-01-04T00:00:00Z'),
  ('artist-5', 'João Vitor',          '', 'https://raw.githubusercontent.com/Gabrielwo1/tatto-view/claude/tattoo-shop-app-AunfI/public/jaummmm.jpeg', ARRAY[]::text[], '2025-01-05T00:00:00Z'),
  ('artist-6', 'Marlon Torture',      '', 'https://picsum.photos/seed/marlon-torture/400/400', ARRAY[]::text[], '2025-01-06T00:00:00Z')
) AS v(id, name, bio, photo_url, specialties, created_at)
WHERE NOT EXISTS (SELECT 1 FROM artists LIMIT 1);

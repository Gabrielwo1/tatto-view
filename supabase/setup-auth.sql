-- ══════════════════════════════════════════════════════════════════════════
-- El Dude Tattoo — Autenticação de Usuários
-- Cole este SQL no SQL Editor do seu projeto Supabase e execute.
-- https://supabase.com/dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════════════════

-- ── PASSO 1: Adicionar coluna de vínculo na tabela artists ─────────────────
ALTER TABLE artists ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- ── PASSO 2: Criar tabela de perfis de usuário ─────────────────────────────
-- Vincula cada usuário do Supabase Auth a um papel (admin ou artista)
CREATE TABLE IF NOT EXISTS user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'artist')),
  artist_id  TEXT REFERENCES artists(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PASSO 3: Políticas de segurança para user_profiles ────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_profile" ON user_profiles;
CREATE POLICY "users_read_own_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- ── PASSO 4: Atualizar políticas RLS da tabela artists ─────────────────────
-- Leitura pública (site público continua funcionando)
-- Escrita restrita: admin escreve tudo; artista só atualiza o próprio perfil

DROP POLICY IF EXISTS "public_all" ON artists;

CREATE POLICY "artists_public_read" ON artists
  FOR SELECT USING (true);

CREATE POLICY "artists_admin_insert" ON artists
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "artists_update_own_or_admin" ON artists
  FOR UPDATE USING (
    auth_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "artists_admin_delete" ON artists
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── PASSO 5: Atualizar políticas RLS da tabela tattoos ────────────────────
-- Leitura pública; escrita restrita ao dono da tattoo ou admin

DROP POLICY IF EXISTS "public_all" ON tattoos;

CREATE POLICY "tattoos_public_read" ON tattoos
  FOR SELECT USING (true);

CREATE POLICY "tattoos_insert" ON tattoos
  FOR INSERT WITH CHECK (
    -- Admin pode inserir qualquer tattoo
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    -- Artista só pode inserir com seu próprio artist_id
    EXISTS (
      SELECT 1 FROM artists a
      WHERE a.id = artist_id AND a.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "tattoos_update" ON tattoos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    EXISTS (
      SELECT 1 FROM artists a
      WHERE a.id = artist_id AND a.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "tattoos_delete" ON tattoos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    EXISTS (
      SELECT 1 FROM artists a
      WHERE a.id = artist_id AND a.auth_user_id = auth.uid()
    )
  );

-- ══════════════════════════════════════════════════════════════════════════
-- PASSO 6: Rodar DEPOIS de criar os usuários no Supabase Auth Dashboard
--
-- Instruções:
-- 1. Vá em Authentication → Users → Add user
-- 2. Crie cada usuário com email e senha
-- 3. Copie o UUID de cada usuário criado
-- 4. Substitua os valores abaixo e execute
-- ══════════════════════════════════════════════════════════════════════════

-- Super Admin (usuário ADMIN)
-- Substitua 'COLE-O-UUID-DO-ADMIN-AQUI' pelo UUID do usuário admin
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-O-UUID-DO-ADMIN-AQUI', 'admin', NULL);

-- Artistas — substitua cada UUID pelo UUID criado no Supabase Auth
-- e confirme os artist_id correspondentes na tabela artists

-- Braian Otovicz
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-BRAIAN-AQUI', 'artist', 'artist-1');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-BRAIAN-AQUI' WHERE id = 'artist-1';

-- Luiz Balestro
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-LUIZ-AQUI', 'artist', 'artist-2');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-LUIZ-AQUI' WHERE id = 'artist-2';

-- Matheus de Oliveira
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-MATHEUS-AQUI', 'artist', 'artist-3');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-MATHEUS-AQUI' WHERE id = 'artist-3';

-- Ana Biasi
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-ANA-AQUI', 'artist', 'artist-4');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-ANA-AQUI' WHERE id = 'artist-4';

-- João Vitor
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-JOAO-AQUI', 'artist', 'artist-5');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-JOAO-AQUI' WHERE id = 'artist-5';

-- Marlon Torture
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-MARLON-AQUI', 'artist', 'artist-6');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-MARLON-AQUI' WHERE id = 'artist-6';

-- Dionatan Lacerda
-- ATENÇÃO: Confirme o ID do Dionatan em Table Editor → artists → coluna id
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-DIONATAN-AQUI', 'artist', 'COLE-ID-DIONATAN-AQUI');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-DIONATAN-AQUI' WHERE id = 'COLE-ID-DIONATAN-AQUI';

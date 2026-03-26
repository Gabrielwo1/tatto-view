-- ══════════════════════════════════════════════════════════════════════════
-- El Dude Tattoo — Autenticação de Usuários
-- Cole este SQL no SQL Editor do seu projeto Supabase e execute.
-- https://supabase.com/dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════════════════

-- ── PASSO 1: Adicionar coluna de vínculo na tabela artists ─────────────────
ALTER TABLE artists ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- ── PASSO 2: Criar tabela de perfis de usuário ─────────────────────────────
-- Vincula cada usuário do Supabase Auth a um papel (admin, artist ou merch_manager)
CREATE TABLE IF NOT EXISTS user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'artist', 'merch_manager', 'content_editor')),
  artist_id  TEXT REFERENCES artists(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Se a tabela já existe com o CHECK antigo, atualize o constraint:
-- ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
-- ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check
--   CHECK (role IN ('admin', 'artist', 'merch_manager', 'content_editor'));

-- ── PASSO 3: Políticas de segurança para user_profiles ────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_profile" ON user_profiles;
CREATE POLICY "users_read_own_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- ── PASSO 4: Atualizar políticas RLS da tabela artists ─────────────────────
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
DROP POLICY IF EXISTS "public_all" ON tattoos;

CREATE POLICY "tattoos_public_read" ON tattoos
  FOR SELECT USING (true);

CREATE POLICY "tattoos_insert" ON tattoos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    OR
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

-- ── PASSO 6: Políticas RLS da tabela merchs ───────────────────────────────
-- Admin e merch_manager podem gerenciar merchs; leitura pública

DROP POLICY IF EXISTS "public_all" ON merchs;
DROP POLICY IF EXISTS "merchs_public_read" ON merchs;
DROP POLICY IF EXISTS "merchs_write" ON merchs;

CREATE POLICY "merchs_public_read" ON merchs
  FOR SELECT USING (true);

CREATE POLICY "merchs_insert" ON merchs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'merch_manager', 'content_editor')
    )
  );

CREATE POLICY "merchs_update" ON merchs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'merch_manager', 'content_editor')
    )
  );

CREATE POLICY "merchs_delete" ON merchs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'merch_manager', 'content_editor')
    )
  );

-- ── PASSO 7: Políticas RLS da tabela site_config ──────────────────────────
-- admin e content_editor podem escrever; leitura pública

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_config_public_read" ON site_config;
DROP POLICY IF EXISTS "site_config_write" ON site_config;

CREATE POLICY "site_config_public_read" ON site_config
  FOR SELECT USING (true);

CREATE POLICY "site_config_insert" ON site_config
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'content_editor')
    )
  );

CREATE POLICY "site_config_update" ON site_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'content_editor')
    )
  );

CREATE POLICY "site_config_delete" ON site_config
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'content_editor')
    )
  );

-- ══════════════════════════════════════════════════════════════════════════
-- PASSO 8: Criar usuários no Supabase e vincular perfis
--
-- Instruções:
-- 1. Vá em Authentication → Users → Invite user
-- 2. Informe o email de cada pessoa — elas receberão um link para definir a senha
-- 3. Copie o UUID de cada usuário criado
-- 4. Substitua os UUIDs abaixo e execute este bloco
--
-- FLUXO DE SENHA: cada usuário recebe um email de invite e define a própria senha.
-- Para trocar a senha no futuro: "Esqueci minha senha" na tela de login → email de reset.
-- ══════════════════════════════════════════════════════════════════════════

-- ── 1. Super Admin — Braian Otovicz (braianoto@gmail.com) ─────────────────
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-BRAIAN-AQUI', 'admin', NULL);

-- ── 2. Artista — Luiz Balestro (luizbalestro@gmail.com) ──────────────────
-- Confirme o ID do Luiz em Table Editor → artists → coluna id
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-LUIZ-AQUI', 'artist', 'COLE-ID-LUIZ-AQUI');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-LUIZ-AQUI' WHERE id = 'COLE-ID-LUIZ-AQUI';

-- ── 3. Artista — Matheus Zatta de Oliveira (Matheus_oliveira32@hotmail.com)
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-MATHEUS-AQUI', 'artist', 'COLE-ID-MATHEUS-AQUI');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-MATHEUS-AQUI' WHERE id = 'COLE-ID-MATHEUS-AQUI';

-- ── 4. Artista — Ana Biasi (anabiasi2012@gmail.com) ───────────────────────
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-ANA-AQUI', 'artist', 'COLE-ID-ANA-AQUI');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-ANA-AQUI' WHERE id = 'COLE-ID-ANA-AQUI';

-- ── 5. Artista — João Victor (joaovitor.mm47@gmail.com) ──────────────────
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-JOAO-AQUI', 'artist', 'COLE-ID-JOAO-AQUI');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-JOAO-AQUI' WHERE id = 'COLE-ID-JOAO-AQUI';

-- ── 6. Artista — Marlon Alexsandro Tortora (marlito0404@gmail.com) ────────
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-MARLON-AQUI', 'artist', 'COLE-ID-MARLON-AQUI');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-MARLON-AQUI' WHERE id = 'COLE-ID-MARLON-AQUI';

-- ── 7. Artista — Dionatan Lacerda (dk2dionatan@gmail.com) ────────────────
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-DIONATAN-AQUI', 'artist', 'COLE-ID-DIONATAN-AQUI');
-- UPDATE artists SET auth_user_id = 'COLE-UUID-DIONATAN-AQUI' WHERE id = 'COLE-ID-DIONATAN-AQUI';

-- ── 8. Editor de Conteúdo — Gustavo Pacheco (gustavo_tres@hotmail.com) ────
-- Acesso: Guests, Landing Page, Sobre Nós, Events, Loja
-- Não precisa de artist_id (não é artista)
-- INSERT INTO user_profiles (id, role, artist_id)
-- VALUES ('COLE-UUID-GUSTAVO-AQUI', 'content_editor', NULL);
--
-- Se o Gustavo já existe como merch_manager, atualize com:
-- UPDATE user_profiles SET role = 'content_editor' WHERE id = 'COLE-UUID-GUSTAVO-AQUI';

-- ══════════════════════════════════════════════════════════════════════════
-- El Dude Tattoo — Correção de RLS Policies (Security Advisor)
-- Cole este SQL no SQL Editor do Supabase e execute.
-- https://supabase.com/dashboard → SQL Editor → New query
--
-- Corrige os avisos "RLS Policy Always True" do Security Advisor para as
-- tabelas: expenses, ficha_submissions, site_config
-- (artists, tattoos e merchs já foram corrigidos em setup-auth.sql)
-- ══════════════════════════════════════════════════════════════════════════

-- ── Helper: verifica se o usuário atual é admin ────────────────────────────
-- Reutilizado em todas as policies abaixo.
-- Equivale a: EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')

-- ── 1. EXPENSES ────────────────────────────────────────────────────────────
-- Apenas admin e artistas podem ver/gerenciar despesas.
-- (leitura pública NÃO faz sentido para dados financeiros)

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all"       ON expenses;
DROP POLICY IF EXISTS "expenses_read"    ON expenses;
DROP POLICY IF EXISTS "expenses_insert"  ON expenses;
DROP POLICY IF EXISTS "expenses_update"  ON expenses;
DROP POLICY IF EXISTS "expenses_delete"  ON expenses;

CREATE POLICY "expenses_read" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'artist')
    )
  );

CREATE POLICY "expenses_insert" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'artist')
    )
  );

CREATE POLICY "expenses_update" ON expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'artist')
    )
  );

CREATE POLICY "expenses_delete" ON expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── 2. FICHA_SUBMISSIONS ───────────────────────────────────────────────────
-- Qualquer pessoa pode enviar (INSERT anônimo para o formulário público).
-- Apenas admin pode ler, atualizar ou deletar as fichas recebidas.

ALTER TABLE ficha_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all"                  ON ficha_submissions;
DROP POLICY IF EXISTS "ficha_public_insert"         ON ficha_submissions;
DROP POLICY IF EXISTS "ficha_admin_read"            ON ficha_submissions;
DROP POLICY IF EXISTS "ficha_admin_update"          ON ficha_submissions;
DROP POLICY IF EXISTS "ficha_admin_delete"          ON ficha_submissions;

-- Envio público do formulário (sem autenticação)
CREATE POLICY "ficha_public_insert" ON ficha_submissions
  FOR INSERT WITH CHECK (true);

-- Apenas admin visualiza as fichas recebidas
CREATE POLICY "ficha_admin_read" ON ficha_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "ficha_admin_update" ON ficha_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "ficha_admin_delete" ON ficha_submissions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── 3. SITE_CONFIG ─────────────────────────────────────────────────────────
-- Leitura pública (o site precisa carregar as configs sem autenticação).
-- Escrita restrita ao admin (cores, logo, favicon, etc.).

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all"          ON site_config;
DROP POLICY IF EXISTS "site_config_read"    ON site_config;
DROP POLICY IF EXISTS "site_config_insert"  ON site_config;
DROP POLICY IF EXISTS "site_config_update"  ON site_config;
DROP POLICY IF EXISTS "site_config_delete"  ON site_config;

-- Leitura pública necessária para o site carregar tema/logo/favicon
CREATE POLICY "site_config_public_read" ON site_config
  FOR SELECT USING (true);

CREATE POLICY "site_config_admin_insert" ON site_config
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "site_config_admin_update" ON site_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "site_config_admin_delete" ON site_config
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ══════════════════════════════════════════════════════════════════════════
-- Verificação: rode para confirmar que as policies foram criadas
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('expenses', 'ficha_submissions', 'site_config')
-- ORDER BY tablename, cmd;
-- ══════════════════════════════════════════════════════════════════════════

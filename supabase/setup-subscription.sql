-- ══════════════════════════════════════════════════════════════════════════
-- Vitrink — Sistema de Assinatura (Trial 10 dias + R$39,90/mês)
-- Execute no SQL Editor do Supabase após o setup-auth.sql
-- ══════════════════════════════════════════════════════════════════════════

-- ── 1. Adicionar colunas de assinatura em user_profiles ────────────────────
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS trial_end_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id  TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing'
    CHECK (subscription_status IN ('trialing','active','past_due','canceled','unpaid'));

-- ── 2. Atualizar usuários existentes que não têm trial definido ────────────
UPDATE user_profiles
SET trial_end_at = NOW() + INTERVAL '10 days'
WHERE trial_end_at IS NULL;

-- ── 3. Trigger: auto-define trial_end_at ao criar novo perfil ─────────────
CREATE OR REPLACE FUNCTION set_trial_end_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.trial_end_at IS NULL THEN
    NEW.trial_end_at := NOW() + INTERVAL '10 days';
  END IF;
  IF NEW.subscription_status IS NULL THEN
    NEW.subscription_status := 'trialing';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_trial_end_at ON user_profiles;
CREATE TRIGGER trg_set_trial_end_at
  BEFORE INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_trial_end_at();

-- ── 4. Política RLS: permitir que o webhook (service role) atualize ────────
-- O webhook usa a service role key, que ignora RLS por padrão.
-- Nenhuma policy adicional necessária para service role.

-- ── 5. Expor trial_end_at e subscription_status na policy de leitura ───────
-- A policy "users_read_own_profile" já permite ao usuário ler seu próprio perfil.
-- Nenhuma alteração necessária.

-- ══════════════════════════════════════════════════════════════════════════
-- Para marcar um admin como "sempre ativo" (sem trial):
-- UPDATE user_profiles SET subscription_status = 'active', trial_end_at = NULL
-- WHERE id = 'UUID-DO-ADMIN';
-- ══════════════════════════════════════════════════════════════════════════

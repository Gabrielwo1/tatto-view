-- ══════════════════════════════════════════════════════════════════════════
-- Vitrink — Tiered Pricing Plans
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════════════════

-- ── 1. Adicionar colunas de plano em user_profiles ────────────────────────
--
-- max_artists: quantos artistas o estúdio pode ter ativos (definido pelo plano)
-- plan_key:    identificador do plano (starter | duo | trio | studio | pro | agency)

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS max_artists INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS plan_key    TEXT    NOT NULL DEFAULT 'starter';

-- ── 2. Atualizar studios existentes com plano padrão (se necessário) ──────
--
-- Estúdios que já existiam antes dos planos recebem o plano "starter" (1 artista).
-- Se quiser conceder um plano maior para estúdios existentes, ajuste aqui:
--
-- UPDATE user_profiles SET max_artists = 15, plan_key = 'agency'
-- WHERE studio_id IN ('eldude', 'amigo1', 'amigo2');

-- ── 3. Verificação ────────────────────────────────────────────────────────
-- SELECT id, studio_id, role, subscription_status, max_artists, plan_key
-- FROM user_profiles
-- ORDER BY created_at DESC;

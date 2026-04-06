/**
 * setup-supabase.mjs
 * Dropa e recria todas as tabelas do projeto no Supabase.
 * Uso: node setup-supabase.mjs
 */

import https from 'https';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Carregar .env manualmente ──────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, '.env');

let SUPABASE_URL = process.env.VITE_SUPABASE_URL;
let SECRET_KEY   = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;

try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const [k, ...rest] = line.split('=');
    const v = rest.join('=').trim();
    if (k?.trim() === 'VITE_SUPABASE_URL' && !SUPABASE_URL)   SUPABASE_URL = v;
  }
} catch { /* sem .env local */ }

// Chave secret passada diretamente via argumento ou variável
const SECRET_KEY_ARG = process.argv[2] || SECRET_KEY;

if (!SUPABASE_URL) {
  console.error('❌ VITE_SUPABASE_URL não encontrado no .env');
  process.exit(1);
}
if (!SECRET_KEY_ARG) {
  console.error('❌ Passe a secret key como argumento: node setup-supabase.mjs sb_secret_...');
  process.exit(1);
}

// Extrair project ref da URL
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split('.')[0];
console.log(`\n🔧 Projeto: ${PROJECT_REF}`);
console.log(`🌐 URL: ${SUPABASE_URL}\n`);

// ── SQL completo ───────────────────────────────────────────────────────────
const SQL_SETUP = `
-- ════════════════════════════════
-- 1. DROP tudo que existia
-- ════════════════════════════════
DROP TABLE IF EXISTS tattoos    CASCADE;
DROP TABLE IF EXISTS merchs     CASCADE;
DROP TABLE IF EXISTS site_config CASCADE;
DROP TABLE IF EXISTS artists    CASCADE;

-- ════════════════════════════════
-- 2. Criar tabelas
-- ════════════════════════════════
CREATE TABLE artists (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  bio         TEXT DEFAULT '',
  photo_url   TEXT NOT NULL DEFAULT '',
  specialties TEXT[] DEFAULT '{}',
  instagram   TEXT,
  whatsapp    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tattoos (
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

CREATE TABLE merchs (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price       TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '',
  link        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE site_config (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════
-- 3. Habilitar RLS
-- ════════════════════════════════
ALTER TABLE artists     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tattoos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- ════════════════════════════════
-- 4. Policies
-- ════════════════════════════════
CREATE POLICY "public_read"    ON artists     FOR SELECT USING (true);
CREATE POLICY "service_write"  ON artists     FOR ALL    USING (true) WITH CHECK (true);

CREATE POLICY "public_read"    ON tattoos     FOR SELECT USING (true);
CREATE POLICY "service_write"  ON tattoos     FOR ALL    USING (true) WITH CHECK (true);

CREATE POLICY "public_read"    ON merchs      FOR SELECT USING (true);
CREATE POLICY "service_write"  ON merchs      FOR ALL    USING (true) WITH CHECK (true);

CREATE POLICY "public_read"    ON site_config FOR SELECT USING (true);
CREATE POLICY "service_write"  ON site_config FOR ALL    USING (true) WITH CHECK (true);

-- ════════════════════════════════
-- 5. Storage bucket para imagens
-- ════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public read images"  ON storage.objects;
DROP POLICY IF EXISTS "public write images" ON storage.objects;

CREATE POLICY "public read images"
  ON storage.objects FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "public write images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
`;

// ── HTTP helper ────────────────────────────────────────────────────────────
function post(url, headers, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data   = JSON.stringify(body);
    const req = https.request({
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      method:   'POST',
      headers:  { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Executar SQL via Management API ───────────────────────────────────────
async function runSQL(sql, label) {
  process.stdout.write(`  ⏳ ${label}...`);
  const res = await post(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    { Authorization: `Bearer ${SECRET_KEY_ARG}` },
    { query: sql }
  );
  if (res.status === 200 || res.status === 201) {
    console.log(' ✅');
    return { ok: true };
  }
  console.log(` ❌ (HTTP ${res.status})`);
  return { ok: false, error: res.body };
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('━'.repeat(50));
  console.log('  SETUP SUPABASE — El Dude Tattoo');
  console.log('━'.repeat(50));

  // Tentar Management API
  const result = await runSQL(SQL_SETUP, 'Executando setup completo (drop + create + policies)');

  if (result.ok) {
    console.log('\n✅ Tabelas criadas com sucesso!\n');
    console.log('Próximos passos:');
    console.log('  1. Abra http://localhost:5173/admin');
    console.log('  2. Login: admin / tatto123');
    console.log('  3. Configurações → "Sincronizar para a Nuvem"');
    console.log('  4. Vercel → Redeploy\n');
    return;
  }

  // Se falhou, tentar via PostgREST RPC como fallback
  console.log('\n⚠️  Management API retornou erro:');
  console.log(JSON.stringify(result.error, null, 2));
  console.log('\n━━━ SOLUÇÃO ALTERNATIVA ━━━');
  console.log('A chave sb_secret_* não é um Personal Access Token (PAT).');
  console.log('Para executar SQL automaticamente, você precisa de um PAT:');
  console.log('  → https://supabase.com/dashboard/account/tokens');
  console.log('  → Clique em "Generate new token"');
  console.log('  → Cole o token gerado e rode:');
  console.log(`  → node setup-supabase.mjs SEU_TOKEN_AQUI\n`);
  console.log('OU, para executar manualmente (30 segundos):');
  console.log(`  → https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
  console.log('  → Cole e execute o SQL do arquivo supabase/setup.sql\n');
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err.message);
  process.exit(1);
});

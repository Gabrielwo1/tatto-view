import { useState } from 'react';
import { useStore } from '../../store';
import { THEMES, applyTheme, getThemeForHostname } from '../../lib/themes';
import type { ThemeId } from '../../lib/themes';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/uploadImage';

interface StorageDiag {
  usedKB: number;
  limitKB: number;
  base64Count: number;
  base64KB: number;
  supabaseOk: boolean | null; // null = not tested yet
  bucketExists: boolean | null;
}

const THEME_ORDER: ThemeId[] = ['ember', 'crimson', 'violet', 'rose', 'gold', 'neon', 'cyan'];

export default function AdminSettings() {
  const themeId  = useStore((s) => s.themeId);
  const setTheme = useStore((s) => s.setTheme);
  const tattoos  = useStore((s) => s.tattoos);
  const artists  = useStore((s) => s.artists);
  const merchs   = useStore((s) => s.merchs);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'ok' | 'error'>('idle');
  const [diag, setDiag] = useState<StorageDiag | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [reuploadStatus, setReuploadStatus] = useState<'idle' | 'running' | 'ok' | 'error'>('idle');
  const [reuploadProgress, setReuploadProgress] = useState({ done: 0, total: 0 });

  async function handleSyncToSupabase() {
    if (!supabase) {
      alert('Supabase não está configurado. Verifique as variáveis de ambiente.');
      return;
    }
    setSyncStatus('syncing');
    try {
      // Upsert all local data to Supabase
      const artistRows = artists.map((a) => ({
        id: a.id, name: a.name, bio: a.bio, photo_url: a.photoUrl,
        specialties: a.specialties, instagram: a.instagram, whatsapp: a.whatsapp,
        created_at: a.createdAt,
      }));
      const tattooRows = tattoos.map((t) => ({
        id: t.id, title: t.title, description: t.description,
        image_url: t.imageUrl, style: t.style, price: t.price,
        artist_id: t.artistId, status: t.status, created_at: t.createdAt,
      }));
      const merchRows = merchs.map((m) => ({
        id: m.id, name: m.name, description: m.description,
        price: m.price, image_url: m.imageUrl, link: m.link, created_at: m.createdAt,
      }));

      const results = await Promise.all([
        artistRows.length ? supabase.from('artists').upsert(artistRows) : Promise.resolve({ error: null }),
        tattooRows.length ? supabase.from('tattoos').upsert(tattooRows) : Promise.resolve({ error: null }),
        merchRows.length  ? supabase.from('merchs').upsert(merchRows)   : Promise.resolve({ error: null }),
      ]);

      const err = results.find((r) => r.error)?.error;
      if (err) throw err;

      setSyncStatus('ok');
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err) {
      console.error('[sync]', err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  }

  async function runDiagnostic() {
    setDiagLoading(true);
    try {
      // LocalStorage usage
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const v = localStorage.getItem(localStorage.key(i)!) ?? '';
        totalBytes += v.length * 2;
      }

      // Count base64 images in tattoos, artists, merchs
      const allImages = [
        ...tattoos.map((t) => t.imageUrl),
        ...artists.map((a) => a.photoUrl),
        ...merchs.map((m) => m.imageUrl),
      ];
      const base64Images = allImages.filter((u) => u?.startsWith('data:'));
      const base64Bytes = base64Images.reduce((acc, u) => acc + (u?.length ?? 0) * 2, 0);

      // Test Supabase bucket
      let supabaseOk: boolean | null = null;
      let bucketExists: boolean | null = null;
      if (supabase) {
        try {
          const { error } = await supabase.storage.from('images').list('', { limit: 1 });
          supabaseOk = true;
          bucketExists = !error;
        } catch {
          supabaseOk = false;
          bucketExists = false;
        }
      }

      setDiag({
        usedKB: Math.round(totalBytes / 1024),
        limitKB: 5120, // ~5MB typical localStorage limit
        base64Count: base64Images.length,
        base64KB: Math.round(base64Bytes / 1024),
        supabaseOk,
        bucketExists,
      });
    } finally {
      setDiagLoading(false);
    }
  }

  async function handleReuploadBase64() {
    setReuploadStatus('running');
    const updateTattoo = useStore.getState().updateTattoo;
    const updateArtist = useStore.getState().updateArtist;

    const base64Tattoos = tattoos.filter((t) => t.imageUrl?.startsWith('data:'));
    const base64Artists = artists.filter((a) => a.photoUrl?.startsWith('data:'));
    const total = base64Tattoos.length + base64Artists.length;
    let done = 0;
    setReuploadProgress({ done: 0, total });

    try {
      for (const t of base64Tattoos) {
        const url = await uploadImage(t.imageUrl);
        if (!url.startsWith('data:')) updateTattoo(t.id, { imageUrl: url });
        done++;
        setReuploadProgress({ done, total });
      }
      for (const a of base64Artists) {
        const url = await uploadImage(a.photoUrl);
        if (!url.startsWith('data:')) updateArtist(a.id, { photoUrl: url });
        done++;
        setReuploadProgress({ done, total });
      }
      setReuploadStatus('ok');
      await runDiagnostic();
      setTimeout(() => setReuploadStatus('idle'), 5000);
    } catch (err) {
      console.error('[reupload]', err);
      setReuploadStatus('error');
      setTimeout(() => setReuploadStatus('idle'), 5000);
    }
  }

  function handleImportBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Record<string, unknown>;
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
        alert('Backup restaurado com sucesso! A página será recarregada.');
        window.location.reload();
      } catch {
        alert('Arquivo inválido. Certifique-se de usar um backup gerado por este sistema.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleExportBackup() {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      try {
        data[key] = JSON.parse(localStorage.getItem(key)!);
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-eldude-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const subdomainDefault = getThemeForHostname(window.location.hostname);
  const active = themeId ?? subdomainDefault;

  function handleSelect(id: ThemeId) {
    setTheme(id);
    applyTheme(id);
  }

  function handleReset() {
    setTheme(null);
    applyTheme(subdomainDefault);
  }

  const activeTheme = THEMES[active];

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8 md:mb-10">
        <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Estúdio</p>
        <h1 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wide leading-none">
          Configurações
        </h1>
      </div>

      {/* ── Aparência ─────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl uppercase tracking-wide text-white leading-none mb-1">
              Aparência
            </h2>
            <p className="font-body text-xs text-gray-500">
              Cor de destaque aplicada em todo o site instantaneamente.
            </p>
          </div>
          {themeId !== null && (
            <button
              type="button"
              onClick={handleReset}
              className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors shrink-0 ml-4"
            >
              ↩ Restaurar padrão
            </button>
          )}
        </div>

        {/* Active theme hero banner */}
        <div
          className="mb-5 px-5 py-4 flex items-center gap-4 border border-white/10 bg-black/40 transition-all duration-300"
          style={{ borderLeftColor: activeTheme.accent, borderLeftWidth: 3 }}
        >
          <span
            className="w-10 h-10 rounded-full shrink-0 block"
            style={{
              backgroundColor: activeTheme.accent,
              boxShadow: `0 0 20px ${activeTheme.accent}55`,
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-display text-lg uppercase tracking-wide text-white leading-none">
                {activeTheme.label}
              </p>
              <span
                className="font-body text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5"
                style={{ backgroundColor: activeTheme.accent + '22', color: activeTheme.accent }}
              >
                Ativo
              </span>
              {themeId === null && (
                <span className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-700">
                  · padrão
                </span>
              )}
            </div>
            <p className="font-body text-xs text-gray-500">{activeTheme.description}</p>
          </div>
          {/* Live accent preview */}
          <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
            <span
              className="font-display text-xs uppercase tracking-widest"
              style={{ color: activeTheme.accent }}
            >
              El Dude
            </span>
            <span className="flex gap-1">
              {[900, 700, 500, 300, 100].map((stop) => (
                <span
                  key={stop}
                  className="w-4 h-2 rounded-sm"
                  style={{
                    backgroundColor: `rgb(var(--ink-${stop}))`,
                    opacity: stop === 500 ? 1 : 0.8,
                  }}
                />
              ))}
            </span>
          </div>
        </div>

        {/* Theme grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {THEME_ORDER.map((id) => {
            const theme = THEMES[id];
            const isActive = id === active;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelect(id)}
                title={`${theme.label} — ${theme.description}`}
                className="group flex flex-col items-center gap-2 py-3 px-1 rounded-none transition-all focus:outline-none"
              >
                {/* Circle swatch */}
                <span
                  className="relative w-10 h-10 rounded-full block transition-all duration-200"
                  style={{
                    backgroundColor: theme.accent,
                    boxShadow: isActive
                      ? `0 0 0 2px #000, 0 0 0 3px ${theme.accent}, 0 0 16px ${theme.accent}66`
                      : `0 0 0 1px ${theme.accent}33`,
                    transform: isActive ? 'scale(1.12)' : undefined,
                  }}
                >
                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </span>
                {/* Name */}
                <span
                  className={`font-body text-[9px] font-bold tracking-widest uppercase transition-colors leading-none ${
                    isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'
                  }`}
                >
                  {theme.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="my-10 border-t border-white/10" />

      {/* ── Identificação ────────────────────────────────────────────────── */}
      <section>
        <div className="mb-5">
          <h2 className="font-display text-xl uppercase tracking-wide text-white leading-none mb-1">
            Identificação
          </h2>
          <p className="font-body text-xs text-gray-500">
            Informações do estúdio na plataforma vitrink.app.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-4 py-3 border border-white/10 bg-black/30">
            <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600">Domínio</p>
            <p className="font-body text-sm text-white font-mono">{window.location.hostname}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border border-white/10 bg-black/30">
            <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600">Plataforma</p>
            <p className="font-body text-sm text-white font-mono">vitrink.app</p>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="my-10 border-t border-white/10" />

      {/* ── Sincronização ─────────────────────────────────────────────────── */}
      <section>
        <div className="mb-5">
          <h2 className="font-display text-xl uppercase tracking-wide text-white leading-none mb-1">
            Sincronização
          </h2>
          <p className="font-body text-xs text-gray-500">
            Envie todos os dados deste dispositivo para a nuvem (Supabase) e acesse em qualquer dispositivo.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSyncToSupabase}
          disabled={syncStatus === 'syncing'}
          className="flex items-center gap-2 px-5 py-3 border border-white/20 text-white font-body text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncStatus === 'syncing' ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1019 5.636" />
              </svg>
              Sincronizando...
            </>
          ) : syncStatus === 'ok' ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Sincronizado!</span>
            </>
          ) : syncStatus === 'error' ? (
            <>
              <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-red-400">Erro — veja o console</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sincronizar para a Nuvem
            </>
          )}
        </button>
        <p className="mt-3 font-body text-[10px] text-gray-700 tracking-wide">
          {artists.length} artista(s) · {tattoos.length} tatuagem(ns) · {merchs.length} merch(s) neste dispositivo.
        </p>
      </section>

      {/* ── Divider ── */}
      <div className="my-10 border-t border-white/10" />

      {/* ── Armazenamento ─────────────────────────────────────────────────── */}
      <section>
        <div className="mb-5">
          <h2 className="font-display text-xl uppercase tracking-wide text-white leading-none mb-1">
            Armazenamento
          </h2>
          <p className="font-body text-xs text-gray-500">
            Diagnóstico de uso do localStorage e do Supabase Storage.
          </p>
        </div>

        <button
          type="button"
          onClick={runDiagnostic}
          disabled={diagLoading}
          className="flex items-center gap-2 px-5 py-3 border border-white/20 text-white font-body text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {diagLoading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1019 5.636" />
              </svg>
              Verificando...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6M4 20h16" />
              </svg>
              Verificar Armazenamento
            </>
          )}
        </button>

        {diag && (
          <div className="mt-4 space-y-3">
            {/* localStorage bar */}
            <div className="px-4 py-3 border border-white/10 bg-black/30">
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500">
                  LocalStorage
                </p>
                <p className={`font-body text-xs font-mono font-semibold ${
                  diag.usedKB > diag.limitKB * 0.8 ? 'text-red-400' :
                  diag.usedKB > diag.limitKB * 0.5 ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {diag.usedKB} KB / {diag.limitKB} KB
                </p>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    diag.usedKB > diag.limitKB * 0.8 ? 'bg-red-500' :
                    diag.usedKB > diag.limitKB * 0.5 ? 'bg-amber-400' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (diag.usedKB / diag.limitKB) * 100)}%` }}
                />
              </div>
            </div>

            {/* base64 images */}
            <div className={`px-4 py-3 border ${diag.base64Count > 0 ? 'border-amber-500/40 bg-amber-900/10' : 'border-white/10 bg-black/30'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500">
                    Imagens em base64 (local)
                  </p>
                  {diag.base64Count > 0 && (
                    <p className="font-body text-[10px] text-amber-400 mt-0.5">
                      {diag.base64Count} imagem(ns) ocupando ~{diag.base64KB} KB no localStorage
                    </p>
                  )}
                </div>
                <p className={`font-body text-sm font-mono font-bold ${diag.base64Count > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                  {diag.base64Count}
                </p>
              </div>
            </div>

            {/* Supabase status */}
            <div className={`px-4 py-3 border ${
              diag.supabaseOk === null ? 'border-white/10 bg-black/30' :
              diag.supabaseOk && diag.bucketExists ? 'border-green-500/40 bg-green-900/10' :
              'border-red-500/40 bg-red-900/10'
            }`}>
              <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1">
                Supabase Storage
              </p>
              {diag.supabaseOk === null && (
                <p className="font-body text-xs text-gray-600">Não testado</p>
              )}
              {diag.supabaseOk === false && (
                <p className="font-body text-xs text-red-400">
                  Não foi possível conectar ao Supabase. Verifique as credenciais.
                </p>
              )}
              {diag.supabaseOk === true && !diag.bucketExists && (
                <div className="space-y-1">
                  <p className="font-body text-xs text-red-400 font-semibold">
                    Bucket "images" não encontrado — este é o motivo das fotos ficarem no localStorage!
                  </p>
                  <p className="font-body text-[10px] text-gray-500 leading-relaxed">
                    Acesse o Supabase Dashboard → Storage → New bucket → nome: <span className="font-mono text-white/60">images</span> → marque "Public" → Save.
                  </p>
                </div>
              )}
              {diag.supabaseOk === true && diag.bucketExists && (
                <p className="font-body text-xs text-green-400">
                  Conectado e bucket "images" acessível. Uploads de novas imagens irão para a nuvem.
                </p>
              )}
            </div>

            {/* Re-upload button */}
            {diag.base64Count > 0 && diag.supabaseOk && diag.bucketExists && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReuploadBase64}
                  disabled={reuploadStatus === 'running'}
                  className="flex items-center gap-2 px-5 py-3 border border-amber-500/40 text-amber-400 font-body text-xs font-semibold tracking-widest uppercase hover:bg-amber-400 hover:text-black transition-colors disabled:opacity-50"
                >
                  {reuploadStatus === 'running' ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1019 5.636" />
                      </svg>
                      Enviando {reuploadProgress.done}/{reuploadProgress.total}...
                    </>
                  ) : reuploadStatus === 'ok' ? (
                    <span className="text-green-400">Imagens migradas para a nuvem!</span>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Migrar imagens locais para a nuvem
                    </>
                  )}
                </button>
                <p className="mt-2 font-body text-[10px] text-gray-600">
                  Re-envia as {diag.base64Count} imagem(ns) em base64 para o Supabase e libera o localStorage.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Divider ── */}
      <div className="my-10 border-t border-white/10" />

      {/* ── Backup ───────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-5">
          <h2 className="font-display text-xl uppercase tracking-wide text-white leading-none mb-1">
            Backup
          </h2>
          <p className="font-body text-xs text-gray-500">
            Exporte todos os dados (artistas, tatuagens, configurações) ou restaure a partir de um backup anterior.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-5 py-3 border border-white/20 text-white font-body text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar Backup
          </button>

          <label className="flex items-center gap-2 px-5 py-3 border border-white/10 text-gray-500 font-body text-xs font-semibold tracking-widest uppercase hover:border-white/30 hover:text-white transition-colors cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Restaurar Backup
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportBackup}
            />
          </label>
        </div>
        <p className="mt-3 font-body text-[10px] text-gray-700 tracking-wide">
          Para migrar dados: baixe o backup aqui → acesse o site publicado → restaure o backup lá.
        </p>
      </section>
    </div>
  );
}

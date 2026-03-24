import { useState, useRef } from 'react';
import { useStore } from '../../store';
import { THEMES, applyTheme, applyCustomColors, generateShades, getThemeForHostname } from '../../lib/themes';
import type { ThemeId, LogoColorMode } from '../../lib/themes';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/uploadImage';

const THEME_ORDER: ThemeId[] = ['ember', 'crimson', 'violet', 'rose', 'gold', 'neon', 'cyan'];

/** Renders a 10-stop shade strip from a hex color */
function ShadeStrip({ hex, prefix = '--ink' }: { hex: string; prefix?: string }) {
  const shades = generateShades(hex, prefix);
  const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  return (
    <div className="flex gap-0.5 flex-1">
      {stops.map((stop) => {
        const rgb = shades[`${prefix}-${stop}`];
        const color = rgb ? `rgb(${rgb.replace(/ /g, ',')})` : 'transparent';
        return (
          <div
            key={stop}
            className="flex-1 h-5 rounded-sm"
            style={{ backgroundColor: color }}
            title={`${stop}: ${color}`}
          />
        );
      })}
    </div>
  );
}

export default function AdminSettings() {
  const themeId  = useStore((s) => s.themeId);
  const setTheme = useStore((s) => s.setTheme);
  const customPrimary   = useStore((s) => s.customPrimary);
  const customSecondary = useStore((s) => s.customSecondary);
  const setCustomColors = useStore((s) => s.setCustomColors);
  const logoColorMode   = useStore((s) => s.logoColorMode);
  const setLogoColorMode = useStore((s) => s.setLogoColorMode);
  const customLogo    = useStore((s) => s.customLogo);
  const setCustomLogo = useStore((s) => s.setCustomLogo);

  const [logoUploading, setLogoUploading] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  const [draftPrimary,   setDraftPrimary]   = useState(customPrimary   ?? '#ff4500');
  const [draftSecondary, setDraftSecondary] = useState(customSecondary ?? '#3b82f6');
  const tattoos          = useStore((s) => s.tattoos);
  const artists          = useStore((s) => s.artists);
  const merchs           = useStore((s) => s.merchs);
  const landingContent   = useStore((s) => s.landingContent);
  const sobreNosContent  = useStore((s) => s.sobreNosContent);
  const guestContent     = useStore((s) => s.guestContent);
  const aftercareContent = useStore((s) => s.aftercareContent);
  const fichaSubmissions = useStore((s) => s.fichaSubmissions);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'ok' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<string | null>(null);
  const [connStatus, setConnStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [connError, setConnError] = useState<string | null>(null);

  const updateArtist = useStore((s) => s.updateArtist);
  const updateTattoo = useStore((s) => s.updateTattoo);
  const updateMerch  = useStore((s) => s.updateMerch);
  const setSobreNosContent = useStore((s) => s.setSobreNosContent);

  async function handleLogoUpload(file: File) {
    setLogoUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((res) => {
        reader.onload = (e) => res(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      const url = await uploadImage(dataUrl);
      setCustomLogo(url);
    } catch (err) {
      console.error('[AdminSettings] logo upload failed:', err);
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleSyncToSupabase() {
    if (!supabase) {
      alert('Supabase não está configurado. Verifique as variáveis de ambiente.');
      return;
    }
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      // ── Re-upload base64 images to Supabase Storage ──────────────────────
      setSyncProgress('Fazendo upload das imagens...');

      const processedArtists = await Promise.all(artists.map(async (a) => {
        if (!a.photoUrl?.startsWith('data:')) return a;
        const url = await uploadImage(a.photoUrl);
        if (url !== a.photoUrl) updateArtist(a.id, { photoUrl: url });
        return { ...a, photoUrl: url };
      }));

      const processedTattoos = await Promise.all(tattoos.map(async (t) => {
        if (!t.imageUrl?.startsWith('data:')) return t;
        const url = await uploadImage(t.imageUrl);
        if (url !== t.imageUrl) updateTattoo(t.id, { imageUrl: url });
        return { ...t, imageUrl: url };
      }));

      const processedMerchs = await Promise.all(merchs.map(async (m) => {
        if (!m.imageUrl?.startsWith('data:')) return m;
        const url = await uploadImage(m.imageUrl);
        if (url !== m.imageUrl) updateMerch(m.id, { imageUrl: url });
        return { ...m, imageUrl: url };
      }));

      // Re-upload collective image in sobreNosContent if base64
      let finalSobreNos = sobreNosContent;
      if (sobreNosContent.collective?.image?.startsWith('data:')) {
        const url = await uploadImage(sobreNosContent.collective.image);
        if (url !== sobreNosContent.collective.image) {
          finalSobreNos = { ...sobreNosContent, collective: { ...sobreNosContent.collective, image: url } };
          setSobreNosContent(finalSobreNos);
        }
      }

      setSyncProgress('Sincronizando dados...');

      // ── Build rows ────────────────────────────────────────────────────────
      const artistRows = processedArtists.map((a) => ({
        id: a.id, name: a.name, bio: a.bio, photo_url: a.photoUrl,
        specialties: a.specialties, instagram: a.instagram, whatsapp: a.whatsapp,
        created_at: a.createdAt,
      }));
      const tattooRows = processedTattoos.map((t) => ({
        id: t.id, title: t.title, description: t.description,
        image_url: t.imageUrl, style: t.style, price: t.price,
        artist_id: t.artistId, status: t.status, created_at: t.createdAt,
      }));
      const merchRows = processedMerchs.map((m) => ({
        id: m.id, name: m.name, description: m.description,
        price: m.price, image_url: m.imageUrl, link: m.link, created_at: m.createdAt,
      }));

      const configRows = [
        { key: 'landingContent',   value: landingContent,    updated_at: new Date().toISOString() },
        { key: 'sobreNosContent',  value: finalSobreNos,     updated_at: new Date().toISOString() },
        { key: 'guestContent',     value: guestContent,     updated_at: new Date().toISOString() },
        { key: 'aftercareContent', value: aftercareContent, updated_at: new Date().toISOString() },
        { key: 'themeId',          value: themeId,          updated_at: new Date().toISOString() },
      ];

      const results = await Promise.all([
        artistRows.length ? supabase.from('artists').upsert(artistRows)     : Promise.resolve({ error: null }),
        tattooRows.length ? supabase.from('tattoos').upsert(tattooRows)     : Promise.resolve({ error: null }),
        merchRows.length  ? supabase.from('merchs').upsert(merchRows)       : Promise.resolve({ error: null }),
        supabase.from('site_config').upsert(configRows),
      ]);

      const err = results.find((r) => r.error)?.error;
      if (err) throw err;

      setSyncStatus('ok');
      setSyncError(null);
      setSyncProgress(null);
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err: unknown) {
      console.error('[sync]', err);
      setSyncStatus('error');
      setSyncProgress(null);
      setSyncError(err instanceof Error ? err.message : JSON.stringify(err));
      setTimeout(() => { setSyncStatus('idle'); setSyncError(null); }, 8000);
    }
  }

  async function handleTestConnection() {
    if (!supabase) {
      setConnStatus('error');
      setConnError('Variáveis VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não configuradas.');
      return;
    }
    setConnStatus('testing');
    setConnError(null);
    try {
      const { error } = await supabase.from('artists').select('count', { count: 'exact', head: true });
      if (error) throw error;
      setConnStatus('ok');
      setTimeout(() => setConnStatus('idle'), 5000);
    } catch (err: unknown) {
      setConnStatus('error');
      setConnError(err instanceof Error ? err.message : JSON.stringify(err));
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
    // Sync draft pickers to preset colors (clear custom)
    setDraftPrimary(THEMES[id].accent);
    setDraftSecondary(THEMES[id].accent2);
    setCustomColors(null, null);
  }

  function handleReset() {
    setTheme(null);
    applyTheme(subdomainDefault);
    setDraftPrimary(THEMES[subdomainDefault].accent);
    setDraftSecondary(THEMES[subdomainDefault].accent2);
    setCustomColors(null, null);
  }

  function handleApplyColors() {
    setCustomColors(draftPrimary, draftSecondary);
    applyCustomColors(draftPrimary, draftSecondary);
  }

  const activeTheme = THEMES[active];
  // Effective hex values (custom overrides preset)
  const effectivePrimary   = customPrimary   ?? activeTheme.accent;
  const effectiveSecondary = customSecondary ?? activeTheme.accent2;

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
              Paleta de cores aplicada em todo o site instantaneamente.
            </p>
          </div>
          {(themeId !== null || customPrimary || customSecondary) && (
            <button type="button" onClick={handleReset}
              className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors shrink-0 ml-4">
              ↩ Restaurar padrão
            </button>
          )}
        </div>

        {/* ── Quick presets ── */}
        <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-3">
          Presets rápidos
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-8">
          {THEME_ORDER.map((id) => {
            const theme = THEMES[id];
            const isActive = id === active && !customPrimary;
            return (
              <button key={id} type="button" onClick={() => handleSelect(id)}
                title={`${theme.label} — ${theme.description}`}
                className="group flex flex-col items-center gap-2 py-3 px-1 transition-all focus:outline-none">
                <span className="relative w-9 h-9 rounded-full block transition-all duration-200"
                  style={{
                    backgroundColor: theme.accent,
                    boxShadow: isActive
                      ? `0 0 0 2px #000, 0 0 0 3px ${theme.accent}, 0 0 14px ${theme.accent}66`
                      : `0 0 0 1px ${theme.accent}33`,
                    transform: isActive ? 'scale(1.12)' : undefined,
                  }}>
                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </span>
                {/* Secondary color dot */}
                <span className="w-3 h-3 rounded-full -mt-1" style={{ backgroundColor: theme.accent2, opacity: 0.7 }} />
                <span className={`font-body text-[9px] font-bold tracking-widest uppercase transition-colors leading-none ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`}>
                  {theme.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Personalizar cores ── */}
        <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-4">
          Personalizar cores
        </p>
        <div className="space-y-4 mb-5">
          {/* Primary */}
          <div className="border border-white/10 bg-black/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <label className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 w-20 shrink-0">
                Primária
              </label>
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={draftPrimary}
                  onChange={(e) => setDraftPrimary(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  style={{ appearance: 'none' }}
                />
              </div>
              <span className="font-mono text-xs text-gray-500 uppercase">{draftPrimary}</span>
              <ShadeStrip hex={draftPrimary} prefix="--ink" />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-body text-[10px] text-gray-700 w-20 shrink-0">Atual</span>
              <span className="w-8 h-8 shrink-0 rounded" style={{ backgroundColor: effectivePrimary }} />
              <span className="font-mono text-xs text-gray-700 uppercase">{effectivePrimary}</span>
              <div className="flex gap-0.5 flex-1">
                {[50,100,200,300,400,500,600,700,800,900].map((s) => (
                  <div key={s} className="flex-1 h-5 rounded-sm" style={{ backgroundColor: `rgb(var(--ink-${s}))` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Secondary */}
          <div className="border border-white/10 bg-black/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <label className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 w-20 shrink-0">
                Secundária
              </label>
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={draftSecondary}
                  onChange={(e) => setDraftSecondary(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                />
              </div>
              <span className="font-mono text-xs text-gray-500 uppercase">{draftSecondary}</span>
              <ShadeStrip hex={draftSecondary} prefix="--ink2" />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-body text-[10px] text-gray-700 w-20 shrink-0">Atual</span>
              <span className="w-8 h-8 shrink-0 rounded" style={{ backgroundColor: effectiveSecondary }} />
              <span className="font-mono text-xs text-gray-700 uppercase">{effectiveSecondary}</span>
              <div className="flex gap-0.5 flex-1">
                {[50,100,200,300,400,500,600,700,800,900].map((s) => (
                  <div key={s} className="flex-1 h-5 rounded-sm" style={{ backgroundColor: `rgb(var(--ink2-${s}))` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <button type="button" onClick={handleApplyColors}
          className="font-body text-[10px] font-bold tracking-widest uppercase bg-white text-black px-5 py-2.5 hover:bg-white/90 transition-colors mb-8">
          Aplicar cores personalizadas
        </button>

        {/* ── Logo ── */}
        <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-3">
          Cor da logo
        </p>
        <div className="flex flex-wrap gap-2">
          {([
            { mode: 'original',  label: 'Original' },
            { mode: 'white',     label: 'Branca' },
            { mode: 'black',     label: 'Preta' },
            { mode: 'primary',   label: 'Cor primária' },
            { mode: 'secondary', label: 'Cor secundária' },
            { mode: 'invert',    label: 'Inverter' },
          ] as { mode: LogoColorMode; label: string }[]).map(({ mode, label }) => (
            <button key={mode} type="button"
              onClick={() => setLogoColorMode(mode)}
              className={`font-body text-[10px] font-semibold tracking-widest uppercase px-4 py-2 border transition-colors ${
                logoColorMode === mode
                  ? 'border-white text-white bg-white/10'
                  : 'border-white/10 text-gray-600 hover:border-white/30 hover:text-gray-400'
              }`}>
              {label}
            </button>
          ))}
        </div>
        {/* Logo preview */}
        <div className="mt-4 px-6 py-4 border border-white/10 bg-black/40 flex items-center justify-center" style={{ minHeight: 80 }}>
          {logoColorMode === 'primary' || logoColorMode === 'secondary' ? (
            <div className="relative inline-block" style={{ height: 48 }}>
              <img src={customLogo ?? '/logosemo-3.png'} alt="Logo preview" className="h-full w-auto object-contain" style={{ filter: 'brightness(0)' }} />
              <div className="absolute inset-0" style={{
                background: logoColorMode === 'primary' ? 'rgb(var(--ink-500))' : 'rgb(var(--ink2-500))',
                mixBlendMode: 'screen',
              }} />
            </div>
          ) : (
            <img src={customLogo ?? '/logosemo-3.png'} alt="Logo preview" style={{
              height: 48,
              filter: logoColorMode === 'white' ? 'brightness(0) invert(1)' : logoColorMode === 'black' ? 'brightness(0)' : logoColorMode === 'invert' ? 'invert(1)' : 'none',
            }} />
          )}
        </div>

        {/* ── Logo upload ── */}
        <div className="mt-6 border border-white/10 bg-black/30 p-4">
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-3">
            Trocar imagem da logo
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Current logo thumbnail */}
            <div className="w-24 h-14 border border-white/10 bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={customLogo ?? '/logosemo-3.png'}
                alt="Logo atual"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={logoUploading}
                onClick={() => logoFileRef.current?.click()}
                className="font-body text-[10px] font-semibold tracking-widest uppercase px-4 py-2.5 border border-white/20 text-white/70 hover:text-white hover:border-white/50 transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {logoUploading ? 'Enviando...' : 'Fazer upload de nova logo'}
              </button>

              {customLogo && (
                <button
                  type="button"
                  onClick={() => setCustomLogo(null)}
                  className="font-body text-[10px] font-semibold tracking-widest uppercase px-4 py-2 border border-white/10 text-gray-600 hover:text-red-400 hover:border-red-400/30 transition-colors flex items-center gap-2"
                >
                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Restaurar logo padrão
                </button>
              )}
            </div>
          </div>

          <input
            ref={logoFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleLogoUpload(f);
              e.target.value = '';
            }}
          />

          <p className="font-body text-[10px] text-gray-700 mt-3">
            Recomendado: PNG ou SVG com fundo transparente. A logo aparece na barra de navegação do site.
          </p>
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

        {/* Connection info */}
        <div className="mb-4 px-4 py-3 border border-white/10 bg-black/30">
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-1">Supabase</p>
          <p className="font-mono text-xs text-gray-400 truncate">
            {import.meta.env.VITE_SUPABASE_URL || <span className="text-red-400">não configurado</span>}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-3">
          {/* Test Connection */}
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={connStatus === 'testing'}
            className="flex items-center gap-2 px-5 py-3 border border-white/10 text-gray-400 font-body text-xs font-semibold tracking-widest uppercase hover:border-white/30 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connStatus === 'testing' ? (
              <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1019 5.636" /></svg>Testando...</>
            ) : connStatus === 'ok' ? (
              <><svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-green-400">Conectado!</span></>
            ) : connStatus === 'error' ? (
              <><svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg><span className="text-red-400">Falhou</span></>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>Testar Conexão</>
            )}
          </button>

          {/* Sync button */}
          <button
            type="button"
            onClick={handleSyncToSupabase}
            disabled={syncStatus === 'syncing'}
            className="flex items-center gap-2 px-5 py-3 border border-white/20 text-white font-body text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncStatus === 'syncing' ? (
              <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1019 5.636" /></svg>{syncProgress ?? 'Sincronizando...'}</>
            ) : syncStatus === 'ok' ? (
              <><svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-green-400">Sincronizado!</span></>
            ) : syncStatus === 'error' ? (
              <><svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg><span className="text-red-400">Erro ao sincronizar</span></>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Sincronizar para a Nuvem</>
            )}
          </button>
        </div>

        {/* Error messages */}
        {connError && (
          <div className="mb-3 px-4 py-3 border border-red-500/30 bg-red-500/10">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-red-400 mb-1">Erro de Conexão</p>
            <p className="font-mono text-xs text-red-300 break-all">{connError}</p>
            {connError.toLowerCase().includes('relation') && (
              <p className="mt-2 font-body text-xs text-red-300/70">
                → As tabelas não existem. Execute o <span className="font-mono">supabase/setup.sql</span> no SQL Editor do Supabase.
              </p>
            )}
          </div>
        )}
        {syncError && (
          <div className="mb-3 px-4 py-3 border border-red-500/30 bg-red-500/10">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-red-400 mb-1">Erro de Sincronização</p>
            <p className="font-mono text-xs text-red-300 break-all">{syncError}</p>
          </div>
        )}

        <p className="font-body text-[10px] text-gray-700 tracking-wide">
          {artists.length} artista(s) · {tattoos.length} tatuagem(ns) · {merchs.length} merch(s) neste dispositivo.
        </p>
      </section>

      {/* ── Divider ── */}
      <div className="my-10 border-t border-white/10" />

      {/* ── Estatísticas ──────────────────────────────────────────────────── */}
      <section>
        <div className="mb-5">
          <h2 className="font-display text-xl uppercase tracking-wide text-white leading-none mb-1">
            Estatísticas
          </h2>
          <p className="font-body text-xs text-gray-500">
            Movimentações reais do estúdio.
          </p>
        </div>

        {/* ── KPI cards compactos ── */}
        {(() => {
          const availTattoos  = tattoos.filter((t) => t.status === 'available').length;
          const archivedTattoos = tattoos.filter((t) => t.status === 'archived').length;
          const styleSet = new Set(tattoos.map((t) => t.style).filter(Boolean));
          const cards = [
            { section: 'Ficha de Anamnese', label: 'Fichas enviadas',    value: fichaSubmissions.length },
            { section: 'Vitrine',           label: 'Tatuagens',           value: tattoos.length },
            { section: 'Vitrine',           label: 'Disponíveis',         value: availTattoos },
            { section: 'Vitrine',           label: 'Arquivadas',          value: archivedTattoos },
            { section: 'Vitrine',           label: 'Estilos',             value: styleSet.size },
            { section: 'Artistas',          label: 'Artistas',            value: artists.length },
            { section: 'Merchs',            label: 'Merchs',              value: merchs.length },
          ];
          return (
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mb-6">
              {cards.map(({ label, value }) => (
                <div key={label} className="px-2.5 py-2.5 border border-white/10 bg-black/30 flex flex-col gap-0.5 min-w-0">
                  <p className="font-display text-xl text-white leading-none">{value.toLocaleString('pt-BR')}</p>
                  <p className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-600 leading-tight truncate">{label}</p>
                </div>
              ))}
            </div>
          );
        })()}

        {/* ── Timeline SVG — fluxo de movimentações (últimas 12 semanas) ── */}
        {(() => {
          const W = 12; // semanas
          const weeks = Array.from({ length: W }, (_, i) => {
            const end = new Date();
            end.setDate(end.getDate() - (W - 1 - i) * 7);
            const start = new Date(end);
            start.setDate(start.getDate() - 6);
            return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
          });

          const inRange = (date: string, s: string, e: string) => date >= s && date <= e;

          const data = weeks.map(({ start, end }) => ({
            label: new Date(end + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            fichas:    fichaSubmissions.filter((f) => inRange(f.submittedAt.slice(0, 10), start, end)).length,
            tatuagens: tattoos.filter((t) => inRange((t.createdAt ?? '').slice(0, 10), start, end)).length,
            artistas:  artists.filter((a) => inRange((a.createdAt ?? '').slice(0, 10), start, end)).length,
          }));

          const maxVal = Math.max(...data.flatMap((d) => [d.fichas, d.tatuagens, d.artistas]), 1);

          const svgH = 80;
          const svgW = 100; // viewBox units (percentual)
          const pad = { l: 0, r: 0, t: 6, b: 18 };
          const chartH = svgH - pad.t - pad.b;
          const chartW = svgW - pad.l - pad.r;
          const step = chartW / (W - 1);

          const toY = (v: number) => pad.t + chartH - (v / maxVal) * chartH;
          const toX = (i: number) => pad.l + i * step;

          const polyline = (key: 'fichas' | 'tatuagens' | 'artistas') =>
            data.map((d, i) => `${toX(i).toFixed(1)},${toY(d[key]).toFixed(1)}`).join(' ');

          const series = [
            { key: 'fichas'    as const, color: 'rgb(var(--ink-500))', label: 'Fichas' },
            { key: 'tatuagens' as const, color: '#ffffff44',            label: 'Tatuagens' },
            { key: 'artistas'  as const, color: '#ffffff22',            label: 'Artistas' },
          ];

          return (
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600">Fluxo de movimentações — últimas 12 semanas</p>
                <div className="flex items-center gap-3 ml-auto">
                  {series.map((s) => (
                    <span key={s.key} className="flex items-center gap-1">
                      <span className="inline-block w-3 h-0.5" style={{ backgroundColor: s.color }} />
                      <span className="font-body text-[9px] text-gray-600">{s.label}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="border border-white/10 bg-black/30 px-3 pt-2 pb-1">
                <svg viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none" className="w-full" style={{ height: 90 }}>
                  {/* grid lines */}
                  {[0, 0.5, 1].map((f) => (
                    <line
                      key={f}
                      x1={pad.l} y1={toY(maxVal * f).toFixed(1)}
                      x2={svgW - pad.r} y2={toY(maxVal * f).toFixed(1)}
                      stroke="rgba(255,255,255,0.05)" strokeWidth="0.3"
                    />
                  ))}
                  {/* series */}
                  {series.map((s) => (
                    <polyline
                      key={s.key}
                      points={polyline(s.key)}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={s.key === 'fichas' ? '1.2' : '0.6'}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  ))}
                  {/* dots on fichas line */}
                  {data.map((d, i) => (
                    <circle
                      key={i}
                      cx={toX(i).toFixed(1)} cy={toY(d.fichas).toFixed(1)}
                      r="0.8" fill="rgb(var(--ink-500))"
                    />
                  ))}
                  {/* x-axis labels */}
                  {data.map((d, i) => (
                    (i % 2 === 0 || i === W - 1) && (
                      <text
                        key={i}
                        x={toX(i).toFixed(1)} y={svgH - 2}
                        textAnchor="middle"
                        fontSize="4"
                        fill="rgba(255,255,255,0.2)"
                        fontFamily="monospace"
                      >{d.label}</text>
                    )
                  ))}
                </svg>
              </div>
            </div>
          );
        })()}

        {/* ── Fichas por artista ── */}
        {fichaSubmissions.length > 0 && (() => {
          const byArtist: Record<string, number> = {};
          fichaSubmissions.forEach((f) => {
            const names: string[] = f.tatuadoresSelecionados?.length
              ? f.tatuadoresSelecionados
              : f.outroTatuador
              ? [f.outroTatuador]
              : ['Não informado'];
            names.forEach((n) => { byArtist[n] = (byArtist[n] ?? 0) + 1; });
          });
          const sorted = Object.entries(byArtist).sort((a, b) => b[1] - a[1]);
          const maxVal = sorted[0]?.[1] ?? 1;
          return (
            <div className="mb-4">
              <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-3">Fichas por artista</p>
              <div className="flex flex-col gap-1.5">
                {sorted.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="font-body text-xs text-gray-400 w-36 truncate shrink-0">{name}</span>
                    <div className="flex-1 h-1.5 bg-white/5 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{ width: `${(count / maxVal) * 100}%`, backgroundColor: 'rgb(var(--ink-500))' }}
                      />
                    </div>
                    <span className="font-body text-xs text-gray-500 w-6 text-right shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Tatuagens por estilo ── */}
        {tattoos.length > 0 && (() => {
          const byStyle: Record<string, number> = {};
          tattoos.forEach((t) => { if (t.style) byStyle[t.style] = (byStyle[t.style] ?? 0) + 1; });
          const sorted = Object.entries(byStyle).sort((a, b) => b[1] - a[1]);
          const maxVal = sorted[0]?.[1] ?? 1;
          return (
            <div className="mb-4">
              <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-3">Tatuagens por estilo</p>
              <div className="flex flex-col gap-1.5">
                {sorted.map(([style, count]) => (
                  <div key={style} className="flex items-center gap-3">
                    <span className="font-body text-xs text-gray-400 w-36 truncate shrink-0">{style}</span>
                    <div className="flex-1 h-1.5 bg-white/5 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{ width: `${(count / maxVal) * 100}%`, backgroundColor: 'rgba(255,255,255,0.25)' }}
                      />
                    </div>
                    <span className="font-body text-xs text-gray-500 w-6 text-right shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {fichaSubmissions.length === 0 && tattoos.length === 0 && (
          <p className="font-body text-xs text-gray-700 italic">Nenhuma movimentação registrada ainda.</p>
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

import { useState, useRef } from 'react';
import { useStore } from '../../store';
import { THEMES, applyTheme, applyCustomColors, generateShades, getThemeForHostname } from '../../lib/themes';
import type { ThemeId } from '../../lib/themes';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/uploadImage';
import { TATTOO_STYLES } from '../../types';
import { getAnalytics, getTopPages, resetAnalytics } from '../../lib/analytics';

const THEME_ORDER: ThemeId[] = ['ember', 'crimson', 'violet', 'rose', 'gold', 'neon', 'cyan'];

function StyleVisibilitySection() {
  const hiddenStyles    = useStore((s) => s.hiddenStyles);
  const setHiddenStyles = useStore((s) => s.setHiddenStyles);
  const customStyles    = useStore((s) => s.customStyles);
  const setCustomStyles = useStore((s) => s.setCustomStyles);
  const [newStyle, setNewStyle] = useState('');

  const allStyles = [...TATTOO_STYLES, ...customStyles];

  function toggle(style: string) {
    setHiddenStyles(
      hiddenStyles.includes(style)
        ? hiddenStyles.filter((s) => s !== style)
        : [...hiddenStyles, style]
    );
  }

  function addStyle() {
    const trimmed = newStyle.trim();
    if (!trimmed || allStyles.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    setCustomStyles([...customStyles, trimmed]);
    setNewStyle('');
  }

  function removeCustomStyle(style: string) {
    setCustomStyles(customStyles.filter((s) => s !== style));
    setHiddenStyles(hiddenStyles.filter((s) => s !== style));
  }

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-xl uppercase tracking-wide text-white leading-none mb-1">
          Estilos da Vitrine
        </h2>
        <p className="font-body text-xs text-gray-500">
          Estilos marcados ficam visíveis no filtro público. Clique para ocultar/mostrar.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TATTOO_STYLES.map((style) => {
          const hidden = hiddenStyles.includes(style);
          return (
            <button
              key={style}
              type="button"
              onClick={() => toggle(style)}
              className={`font-body text-[10px] font-semibold tracking-widest uppercase px-4 py-2 border transition-colors ${
                hidden
                  ? 'border-white/10 text-gray-700 line-through hover:border-white/30 hover:text-gray-500'
                  : 'border-white text-white bg-white/10 hover:bg-white/20'
              }`}
            >
              {style}
            </button>
          );
        })}
        {customStyles.map((style) => {
          const hidden = hiddenStyles.includes(style);
          return (
            <div key={style} className="relative group">
              <button
                type="button"
                onClick={() => toggle(style)}
                className={`font-body text-[10px] font-semibold tracking-widest uppercase px-4 py-2 pr-7 border transition-colors ${
                  hidden
                    ? 'border-white/10 text-gray-700 line-through hover:border-white/30 hover:text-gray-500'
                    : 'border-ink-500 text-ink-500 bg-ink-500/10 hover:bg-ink-500/20'
                }`}
              >
                {style}
              </button>
              <button
                type="button"
                onClick={() => removeCustomStyle(style)}
                title="Remover estilo"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-red-400 transition-colors text-xs leading-none"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Add new style */}
      <div className="flex gap-2 items-center mt-2">
        <input
          type="text"
          value={newStyle}
          onChange={(e) => setNewStyle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStyle(); } }}
          placeholder="Novo estilo..."
          className="bg-transparent border border-white/15 px-3 py-2 text-white text-xs font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors w-40"
        />
        <button
          type="button"
          onClick={addStyle}
          disabled={!newStyle.trim()}
          className="px-4 py-2 border border-white/20 text-white font-body text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          + Adicionar
        </button>
      </div>
      <p className="font-body text-[10px] text-gray-700 mt-2">
        Estilos personalizados aparecem com borda colorida e têm botão × para remover.
      </p>
    </section>
  );
}

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
  const customLogo    = useStore((s) => s.customLogo);
  const setCustomLogo = useStore((s) => s.setCustomLogo);
  const customFavicon    = useStore((s) => s.customFavicon);
  const setCustomFavicon = useStore((s) => s.setCustomFavicon);

  const [logoUploading, setLogoUploading] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const faviconFileRef = useRef<HTMLInputElement>(null);

  const [draftPrimary,   setDraftPrimary]   = useState(customPrimary   ?? '#ff4500');
  const [draftSecondary, setDraftSecondary] = useState(customSecondary ?? '#3b82f6');
  const tattoos          = useStore((s) => s.tattoos);
  const artists          = useStore((s) => s.artists);
  const merchs           = useStore((s) => s.merchs);
  const landingContent   = useStore((s) => s.landingContent);
  const sobreNosContent  = useStore((s) => s.sobreNosContent);
  const guestContent     = useStore((s) => s.guestContent);
  const aftercareContent = useStore((s) => s.aftercareContent);
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

  async function handleFaviconUpload(file: File) {
    setFaviconUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((res) => {
        reader.onload = (e) => res(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      const url = await uploadImage(dataUrl);
      setCustomFavicon(url);
    } catch (err) {
      console.error('[AdminSettings] favicon upload failed:', err);
    } finally {
      setFaviconUploading(false);
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

  return (
    <div className="p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-0.5">Estúdio</p>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide leading-none">Configurações</h1>
      </div>

      {/* ══ GRID 3 COLUNAS ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">

        {/* ╠══ COL 1 — Aparência ══╣ */}
        <div className="space-y-3">

          {/* Presets */}
          <div className="border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500">Tema</p>
              {(themeId !== null || customPrimary || customSecondary) && (
                <button type="button" onClick={handleReset}
                  className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors">
                  ↩ padrão
                </button>
              )}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {THEME_ORDER.map((id) => {
                const theme = THEMES[id];
                const isActive = id === active && !customPrimary;
                return (
                  <button key={id} type="button" onClick={() => handleSelect(id)}
                    title={`${theme.label}`}
                    className="group flex flex-col items-center gap-1.5 py-2 transition-all focus:outline-none">
                    <span className="relative w-7 h-7 rounded-full block transition-all duration-200"
                      style={{
                        backgroundColor: theme.accent,
                        boxShadow: isActive ? `0 0 0 2px #000, 0 0 0 3px ${theme.accent}` : `0 0 0 1px ${theme.accent}33`,
                        transform: isActive ? 'scale(1.15)' : undefined,
                      }}>
                      {isActive && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </span>
                    <span className={`font-body text-[8px] font-bold tracking-widest uppercase leading-none ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-500'}`}>
                      {theme.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom colors — col 1 continuation */}
          <div className="border border-white/10 bg-black/20 p-4">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">Cores personalizadas</p>
            <div className="space-y-2 mb-3">
              <div className="border border-white/10 bg-black/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <label className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-600 w-16 shrink-0">Primária</label>
                  <input type="color" value={draftPrimary} onChange={(e) => setDraftPrimary(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0" style={{ appearance: 'none' }} />
                  <span className="font-mono text-[10px] text-gray-500 uppercase">{draftPrimary}</span>
                  <ShadeStrip hex={draftPrimary} prefix="--ink" />
                </div>
                <div className="flex gap-0.5">
                  {[50,100,200,300,400,500,600,700,800,900].map((s) => (
                    <div key={s} className="flex-1 h-1.5 rounded-sm" style={{ backgroundColor: `rgb(var(--ink-${s}))` }} />
                  ))}
                </div>
              </div>
              <div className="border border-white/10 bg-black/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <label className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-600 w-16 shrink-0">Secundária</label>
                  <input type="color" value={draftSecondary} onChange={(e) => setDraftSecondary(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0" />
                  <span className="font-mono text-[10px] text-gray-500 uppercase">{draftSecondary}</span>
                  <ShadeStrip hex={draftSecondary} prefix="--ink2" />
                </div>
                <div className="flex gap-0.5">
                  {[50,100,200,300,400,500,600,700,800,900].map((s) => (
                    <div key={s} className="flex-1 h-1.5 rounded-sm" style={{ backgroundColor: `rgb(var(--ink2-${s}))` }} />
                  ))}
                </div>
              </div>
            </div>
            <button type="button" onClick={handleApplyColors}
              className="w-full font-body text-[10px] font-bold tracking-widest uppercase bg-white text-black py-2 hover:bg-white/90 transition-colors">
              Aplicar
            </button>
          </div>
        </div>

        {/* ╠══ COL 2 — Imagens + Estilos ══╣ */}
        <div className="space-y-3">

          {/* Logo upload */}
          <div className="border border-white/10 bg-black/20 p-4">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">Imagens do site</p>
            {/* Logo row */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-10 border border-white/10 bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                <img src={customLogo ?? '/logosemo-3.png'} alt="Logo" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[9px] text-gray-600 tracking-widest uppercase mb-1.5">Logo</p>
                <div className="flex gap-2">
                  <button type="button" disabled={logoUploading} onClick={() => logoFileRef.current?.click()}
                    className="font-body text-[9px] font-semibold tracking-widest uppercase px-3 py-1.5 border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-colors disabled:opacity-40">
                    {logoUploading ? 'Enviando...' : '↑ Upload'}
                  </button>
                  {customLogo && (
                    <button type="button" onClick={() => setCustomLogo(null)}
                      className="font-body text-[9px] tracking-widest uppercase px-3 py-1.5 border border-white/10 text-gray-700 hover:text-red-400 hover:border-red-400/30 transition-colors">
                      ✕ Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
            <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = ''; }} />

            {/* Favicon row */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/5">
              <div className="w-10 h-10 border border-white/10 bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                <img src={customFavicon ?? '/dudeicone.png'} alt="Favicon" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[9px] text-gray-600 tracking-widest uppercase mb-1.5">Favicon</p>
                <div className="flex gap-2">
                  <button type="button" disabled={faviconUploading} onClick={() => faviconFileRef.current?.click()}
                    className="font-body text-[9px] font-semibold tracking-widest uppercase px-3 py-1.5 border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-colors disabled:opacity-40">
                    {faviconUploading ? 'Enviando...' : '↑ Upload'}
                  </button>
                  {customFavicon && (
                    <button type="button" onClick={() => setCustomFavicon(null)}
                      className="font-body text-[9px] tracking-widest uppercase px-3 py-1.5 border border-white/10 text-gray-700 hover:text-red-400 hover:border-red-400/30 transition-colors">
                      ✕ Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
            <input ref={faviconFileRef} type="file" accept="image/png,image/svg+xml,image/x-icon,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFaviconUpload(f); e.target.value = ''; }} />
          </div>

          {/* Estilos da Vitrine */}
          <div className="border border-white/10 bg-black/20 p-4">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">Estilos da vitrine</p>
            <StyleVisibilitySection />
          </div>
        </div>

        {/* ╠══ COL 3 — Sistema ══╣ */}
        <div className="space-y-3">

          {/* Identificação */}
          <div className="border border-white/10 bg-black/20 p-4">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">Identificação</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-3 py-2 border border-white/10 bg-black/30">
                <p className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-600">Domínio</p>
                <p className="font-mono text-xs text-white">{window.location.hostname}</p>
              </div>
              <div className="flex items-center justify-between px-3 py-2 border border-white/10 bg-black/30">
                <p className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-600">Plataforma</p>
                <p className="font-mono text-xs text-white">vitrink.app</p>
              </div>
            </div>
          </div>

          {/* Sincronização */}
          <div className="border border-white/10 bg-black/20 p-4">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">Sincronização</p>
            <div className="px-3 py-2 border border-white/10 bg-black/30 mb-3">
              <p className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-600 mb-0.5">Supabase</p>
              <p className="font-mono text-[10px] text-gray-500 truncate">
                {import.meta.env.VITE_SUPABASE_URL || <span className="text-red-400">não configurado</span>}
              </p>
            </div>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={handleTestConnection} disabled={connStatus === 'testing'}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-white/10 text-gray-400 font-body text-[9px] font-semibold tracking-widest uppercase hover:border-white/30 hover:text-white transition-colors disabled:opacity-50">
                {connStatus === 'testing' ? <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1019 5.636" /></svg>Testando</>
                  : connStatus === 'ok' ? <span className="text-green-400">✓ Conectado</span>
                  : connStatus === 'error' ? <span className="text-red-400">✕ Falhou</span>
                  : 'Testar'}
              </button>
              <button type="button" onClick={handleSyncToSupabase} disabled={syncStatus === 'syncing'}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-white/20 text-white font-body text-[9px] font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50">
                {syncStatus === 'syncing' ? <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1019 5.636" /></svg>{syncProgress ?? 'Sync...'}</>
                  : syncStatus === 'ok' ? <span className="text-green-400">✓ Sincronizado</span>
                  : syncStatus === 'error' ? <span className="text-red-400">✕ Erro</span>
                  : '↑ Sincronizar'}
              </button>
            </div>
            {connError && (
              <div className="mb-2 px-3 py-2 border border-red-500/30 bg-red-500/10">
                <p className="font-mono text-[10px] text-red-300 break-all">{connError}</p>
              </div>
            )}
            {syncError && (
              <div className="mb-2 px-3 py-2 border border-red-500/30 bg-red-500/10">
                <p className="font-mono text-[10px] text-red-300 break-all">{syncError}</p>
              </div>
            )}
            <p className="font-body text-[9px] text-gray-700">
              {artists.length} artistas · {tattoos.length} tatuagens · {merchs.length} merchs
            </p>
          </div>

          {/* Backup */}
          <div className="border border-white/10 bg-black/20 p-4">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">Backup</p>
            <div className="flex gap-2">
              <button type="button" onClick={handleExportBackup}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-white/20 text-white font-body text-[9px] font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Baixar
              </button>
              <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-white/10 text-gray-500 font-body text-[9px] font-semibold tracking-widest uppercase hover:border-white/30 hover:text-white transition-colors cursor-pointer">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Restaurar
                <input type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
              </label>
            </div>
          </div>

        </div>{/* fim col 3 */}
      </div>{/* fim grid 3-col */}

      {/* ══ ESTATÍSTICAS — full width ════════════════════════════════════════ */}
      <div className="mt-4">
      <section>
        {(() => {
          const analytics = getAnalytics();
          const today = new Date().toISOString().slice(0, 10);
          const todayViews = analytics.daily[today] ?? 0;
          const uniqueSessions = analytics.sessions.length;

          // Build daily data for last 84 days (12 weeks)
          const D = 84;
          const days = Array.from({ length: D }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (D - 1 - i));
            const key = d.toISOString().slice(0, 10);
            return {
              key,
              label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
              views: analytics.daily[key] ?? 0,
            };
          });

          const maxViews = Math.max(...days.map((d) => d.views), 1);
          const topPages = getTopPages(5);

          const svgH = 80;
          const svgW = 100;
          const pad = { l: 0, r: 0, t: 6, b: 18 };
          const chartH = svgH - pad.t - pad.b;
          const chartW = svgW - pad.l - pad.r;
          const step = chartW / (D - 1);
          const toY = (v: number) => pad.t + chartH - (v / maxViews) * chartH;
          const toX = (i: number) => pad.l + i * step;
          const viewsPoints = days.map((d, i) => `${toX(i).toFixed(1)},${toY(d.views).toFixed(1)}`).join(' ');

          // x-axis labels: show every 14 days
          const labelIndices = days.reduce<number[]>((acc, _, i) => {
            if (i === 0 || i === D - 1 || i % 14 === 0) acc.push(i);
            return acc;
          }, []);

          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl uppercase tracking-wide text-white leading-none mb-0.5">
                    Analytics
                  </h2>
                  <p className="font-body text-xs text-gray-500">Views do site público — últimos 84 dias.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { if (confirm('Resetar todos os dados de analytics?')) { resetAnalytics(); window.location.reload(); } }}
                  className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-700 hover:text-red-400 transition-colors"
                >
                  ✕ resetar
                </button>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-3 gap-px bg-white/10 mb-4">
                {[
                  { label: 'Views totais',   value: analytics.totalViews.toLocaleString('pt-BR') },
                  { label: 'Sessões únicas', value: uniqueSessions.toLocaleString('pt-BR') },
                  { label: 'Hoje',           value: todayViews.toLocaleString('pt-BR') },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-black/30 px-4 py-3">
                    <p className="font-display text-3xl text-white leading-none mb-0.5">{value}</p>
                    <p className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-600">{label}</p>
                  </div>
                ))}
              </div>

              {/* Views chart */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600">Views por dia</p>
                  <span className="flex items-center gap-1 ml-auto">
                    <span className="inline-block w-3 h-0.5" style={{ backgroundColor: 'rgb(var(--ink-500))' }} />
                    <span className="font-body text-[9px] text-gray-600">Views</span>
                  </span>
                </div>
                <div className="border border-white/10 bg-black/30 px-3 pt-2 pb-1">
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none" className="w-full" style={{ height: 100 }}>
                    {[0, 0.5, 1].map((f) => (
                      <line key={f} x1={pad.l} y1={toY(maxViews * f).toFixed(1)} x2={svgW} y2={toY(maxViews * f).toFixed(1)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
                    ))}
                    {/* Area fill */}
                    <polygon
                      points={`${toX(0).toFixed(1)},${(pad.t + chartH).toFixed(1)} ${viewsPoints} ${toX(D - 1).toFixed(1)},${(pad.t + chartH).toFixed(1)}`}
                      fill="rgb(var(--ink-500))"
                      fillOpacity="0.08"
                    />
                    <polyline points={viewsPoints} fill="none" stroke="rgb(var(--ink-500))" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
                    {/* Dots for days with views */}
                    {days.map((d, i) => d.views > 0 && (
                      <circle key={i} cx={toX(i).toFixed(1)} cy={toY(d.views).toFixed(1)} r="0.7" fill="rgb(var(--ink-500))" />
                    ))}
                    {/* x-axis labels */}
                    {labelIndices.map((i) => (
                      <text key={i} x={toX(i).toFixed(1)} y={svgH - 2} textAnchor="middle" fontSize="4" fill="rgba(255,255,255,0.2)" fontFamily="monospace">
                        {days[i].label}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Top pages */}
              {topPages.length > 0 && (
                <div>
                  <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-2">Páginas mais visitadas</p>
                  <div className="flex flex-col gap-1">
                    {topPages.map(({ path, views }) => (
                      <div key={path} className="flex items-center gap-3">
                        <span className="font-mono text-xs text-gray-500 truncate flex-1">{path || '/'}</span>
                        <div className="w-24 h-1 bg-white/5 overflow-hidden shrink-0">
                          <div className="h-full" style={{ width: `${(views / (topPages[0]?.views ?? 1)) * 100}%`, backgroundColor: 'rgb(var(--ink-500))' }} />
                        </div>
                        <span className="font-body text-xs text-gray-600 w-8 text-right shrink-0">{views}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analytics.totalViews === 0 && (
                <p className="font-body text-xs text-gray-700 italic">Nenhuma visita registrada ainda. As visitas das páginas públicas são contadas automaticamente.</p>
              )}
            </>
          );
        })()}
      </section>
      </div>{/* fim mt-4 estatísticas */}
    </div>
  );
}

import { useState, useRef } from 'react';
import { useStore } from '../../store';
import { applyCustomColors, generateShades } from '../../lib/themes';
import { uploadImage } from '../../lib/uploadImage';
import { TATTOO_STYLES } from '../../types';
import { supabase } from '../../lib/supabase';

/* ── Compress old Storage images ──────────────────────────────────────────── */
type CompressState = 'idle' | 'scanning' | 'running' | 'done' | 'error';

function CompressStorageSection() {
  const [state, setState]         = useState<CompressState>('idle');
  const [total, setTotal]         = useState(0);
  const [done, setDone]           = useState(0);
  const [skipped, setSkipped]     = useState(0);
  const [savedBytes, setSavedBytes] = useState(0);
  const [current, setCurrent]     = useState('');
  const abortRef                  = useRef(false);

  async function compressBlob(blob: Blob): Promise<{ blob: Blob; ext: string }> {
    const bmp = await createImageBitmap(blob);
    const MAX = 1440;
    let w = bmp.width, h = bmp.height;
    if (w > MAX || h > MAX) {
      if (w >= h) { h = Math.round(h * MAX / w); w = MAX; }
      else        { w = Math.round(w * MAX / h); h = MAX; }
    }
    const canvas  = document.createElement('canvas');
    canvas.width  = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    // Try WebP first, fall back to JPEG
    return new Promise<{ blob: Blob; ext: string }>((res, rej) => {
      canvas.toBlob((b) => {
        if (b) return res({ blob: b, ext: 'webp' });
        canvas.toBlob((fb) => fb ? res({ blob: fb, ext: 'jpg' }) : rej(new Error('toBlob failed')), 'image/jpeg', 0.82);
      }, 'image/webp', 0.82);
    });
  }

  async function listAll(): Promise<{ name: string }[]> {
    if (!supabase) return [];
    const files: { name: string }[] = [];
    let offset = 0;
    const LIMIT = 200;
    while (true) {
      const { data, error } = await supabase.storage
        .from('images')
        .list('', { limit: LIMIT, offset, sortBy: { column: 'created_at', order: 'asc' } });
      if (error || !data) break;
      const valid = data.filter((f) => f.id !== null);
      files.push(...valid.map((f) => ({ name: f.name })));
      if (data.length < LIMIT) break;
      offset += LIMIT;
    }
    return files;
  }

  async function run() {
    if (!supabase) return;
    abortRef.current = false;
    setState('scanning');
    setDone(0); setSkipped(0); setSavedBytes(0); setCurrent('');

    const files = await listAll();
    setTotal(files.length);
    if (files.length === 0) { setState('done'); return; }
    setState('running');

    for (const file of files) {
      if (abortRef.current) break;
      const name = file.name;
      setCurrent(name);

      // Skip non-images (gif, svg) by extension
      const ext = name.split('.').pop()?.toLowerCase() ?? '';
      if (ext === 'gif' || ext === 'svg' || ext === 'png') {
        setSkipped((s) => s + 1);
        setDone((d) => d + 1);
        continue;
      }

      try {
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(name);
        const res  = await fetch(publicUrl + '?t=' + Date.now()); // bust cache
        if (!res.ok) throw new Error(`fetch ${res.status}`);
        const original = await res.blob();
        const { blob: compressed, ext } = await compressBlob(original);
        const outMime = ext === 'webp' ? 'image/webp' : 'image/jpeg';
        // Use same name for upsert (keeps DB URLs valid)
        const uploadPath = name;

        // Only re-upload if compressed is smaller
        if (compressed.size < original.size) {
          await supabase.storage
            .from('images')
            .upload(uploadPath, compressed, { contentType: outMime, upsert: true });
          setSavedBytes((s) => s + (original.size - compressed.size));
        } else {
          setSkipped((s) => s + 1);
        }
      } catch (e) {
        console.warn('[compress]', name, e);
        setSkipped((s) => s + 1);
      }
      setDone((d) => d + 1);
    }
    setState('done');
  }

  function stop() { abortRef.current = true; }

  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  const saved = savedBytes > 1_048_576
    ? `${(savedBytes / 1_048_576).toFixed(1)} MB`
    : `${(savedBytes / 1024).toFixed(0)} KB`;

  return (
    <section className="border border-white/10 bg-black/20 p-4">
      <div className="mb-3">
        <h2 className="font-display text-xl uppercase tracking-wide text-white leading-none mb-0.5">
          Comprimir Fotos Antigas
        </h2>
        <p className="font-body text-xs text-gray-500">
          Recomprime todas as imagens do Storage para máx 1440px / JPEG 82%. Reduz o egress do Supabase.
        </p>
      </div>

      {state === 'idle' && (
        <button type="button" onClick={run}
          className="font-body text-xs font-bold tracking-widest uppercase px-5 py-2.5 bg-ink-500 text-black hover:bg-ink-400 transition-colors">
          Iniciar compressão
        </button>
      )}

      {(state === 'scanning' || state === 'running') && (
        <div className="space-y-2">
          {state === 'scanning' && (
            <p className="font-body text-xs text-gray-400">Listando arquivos...</p>
          )}
          {state === 'running' && (
            <>
              <div className="flex justify-between font-body text-xs text-gray-400 mb-1">
                <span>{done} / {total}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1 bg-white/5 w-full overflow-hidden">
                <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: 'rgb(var(--ink-500))' }} />
              </div>
              <p className="font-body text-[10px] text-gray-600 truncate">↳ {current}</p>
              {savedBytes > 0 && (
                <p className="font-body text-xs text-ink-500">Economizado até agora: {saved}</p>
              )}
              <button type="button" onClick={stop}
                className="font-body text-[10px] tracking-widest uppercase px-3 py-1 border border-white/20 text-gray-500 hover:text-white transition-colors">
                Parar
              </button>
            </>
          )}
        </div>
      )}

      {state === 'done' && (
        <div className="space-y-1">
          <p className="font-body text-xs text-green-400">Concluído — {done} arquivos processados.</p>
          {savedBytes > 0 && (
            <p className="font-body text-xs text-ink-500">Total economizado: {saved} ({total - skipped} recomprimidas, {skipped} ignoradas)</p>
          )}
          {savedBytes === 0 && (
            <p className="font-body text-xs text-gray-500">Nenhuma imagem precisava de compressão.</p>
          )}
          <button type="button" onClick={() => { setState('idle'); setDone(0); setSkipped(0); setSavedBytes(0); }}
            className="font-body text-[10px] tracking-widest uppercase px-3 py-1 border border-white/20 text-gray-500 hover:text-white transition-colors mt-2">
            Reiniciar
          </button>
        </div>
      )}
    </section>
  );
}

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
  const c = useStore((s) => s.sobreNosContent);
  const setSobreNosContent = useStore((s) => s.setSobreNosContent);
  const { studio } = c;

  const customPrimary   = useStore((s) => s.customPrimary);
  const customSecondary = useStore((s) => s.customSecondary);
  const setCustomColors = useStore((s) => s.setCustomColors);
  const customLogo    = useStore((s) => s.customLogo);
  const setCustomLogo = useStore((s) => s.setCustomLogo);
  const customFavicon    = useStore((s) => s.customFavicon);
  const setCustomFavicon = useStore((s) => s.setCustomFavicon);

  const [logoUploading, setLogoUploading] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [logoFileName, setLogoFileName] = useState<string>('');
  const [faviconUploading, setFaviconUploading] = useState(false);
  const faviconFileRef = useRef<HTMLInputElement>(null);
  const [faviconFileName, setFaviconFileName] = useState<string>('');

  const [draftPrimary,   setDraftPrimary]   = useState(customPrimary   ?? '#ff4500');
  const [draftSecondary, setDraftSecondary] = useState(customSecondary ?? '#3b82f6');

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

  function handleInvert() {
    setDraftPrimary(draftSecondary);
    setDraftSecondary(draftPrimary);
    setCustomColors(draftSecondary, draftPrimary);
    applyCustomColors(draftSecondary, draftPrimary);
  }

  function handleApplyColors() {
    setCustomColors(draftPrimary, draftSecondary);
    applyCustomColors(draftPrimary, draftSecondary);
  }

  const handleStudioChange = (field: keyof typeof studio, value: any) => {
    setSobreNosContent({
      ...c,
      studio: { ...studio, [field]: value }
    });
  };

  const handleHourChange = (index: number, field: string, value: any) => {
    const newHours = [...studio.hours];
    newHours[index] = { ...newHours[index], [field]: value };
    handleStudioChange('hours', newHours);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-0.5">Estúdio</p>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide leading-none">Configurações</h1>
      </div>

      {/* ══ CONFIGURAÇÕES EM GRID ══════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">

        {/* ── COLUNA 1: Identidade e Cores ── */}
        <div className="space-y-6">
          <div className="border border-white/10 bg-black/20 p-5">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-4">Cores personalizadas</p>
            <div className="space-y-3 mb-4">
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
            <div className="flex gap-2">
              <button type="button" onClick={handleInvert}
                title="Inverter Cores"
                className="w-12 shrink-0 flex items-center justify-center bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
              <button type="button" onClick={handleApplyColors}
                className="flex-1 font-body text-[10px] font-bold tracking-widest uppercase bg-white text-black py-2 hover:bg-white/90 transition-colors">
                Aplicar
              </button>
            </div>
          </div>

          <div className="border border-white/10 bg-black/20 p-5">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-4">Imagens do site</p>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-12 border border-white/10 bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={customLogo ?? '/logosemo-3.png'} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[9px] text-gray-600 tracking-widest uppercase mb-1.5">Logo Principal</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={logoUploading} onClick={() => logoFileRef.current?.click()}
                      className="font-body text-[9px] font-semibold tracking-widest uppercase px-3 py-1.5 border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-colors">
                      {logoUploading ? 'Enviando...' : '↑ Upload'}
                    </button>
                    {customLogo && (
                      <button type="button" onClick={() => { setCustomLogo(null); setLogoFileName(''); }}
                        className="font-body text-[9px] tracking-widest uppercase px-3 py-1.5 border border-white/10 text-gray-700 hover:text-red-400 transition-colors">
                        ✕ Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setLogoFileName(f.name); handleLogoUpload(f); } e.target.value = ''; }} />
              
              <div className="flex items-center gap-4 pt-5 border-t border-white/5">
                <div className="w-12 h-12 border border-white/10 bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={customFavicon ?? '/dudeicone.png'} alt="Favicon" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[9px] text-gray-600 tracking-widest uppercase mb-1.5">Favicon (Ícone da Aba)</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={faviconUploading} onClick={() => faviconFileRef.current?.click()}
                      className="font-body text-[9px] font-semibold tracking-widest uppercase px-3 py-1.5 border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-colors">
                      {faviconUploading ? 'Enviando...' : '↑ Upload'}
                    </button>
                    {customFavicon && (
                      <button type="button" onClick={() => { setCustomFavicon(null); setFaviconFileName(''); }}
                        className="font-body text-[9px] tracking-widest uppercase px-3 py-1.5 border border-white/10 text-gray-700 hover:text-red-400 transition-colors">
                        ✕ Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <input ref={faviconFileRef} type="file" accept="image/png,image/svg+xml,image/x-icon,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFaviconFileName(f.name); handleFaviconUpload(f); } e.target.value = ''; }} />
            </div>
          </div>
        </div>

        {/* ── COLUNA 2: Vitrine e Estilos ── */}
        <div className="space-y-6">
          <div className="border border-white/10 bg-black/20 p-5">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-4">Estilos da vitrine</p>
            <StyleVisibilitySection />
          </div>
        </div>

        {/* ── COLUNA 3: Endereço e Horários ── */}
        <div className="space-y-6">
          <div className="border border-white/10 bg-black/20 p-5">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-4">Endereço e Estúdio</p>
            <div className="space-y-4">
              <div>
                <label className="block font-body text-[9px] text-gray-600 tracking-widest uppercase mb-1.5">Título do Estúdio</label>
                <input type="text" value={studio.title} onChange={(e) => handleStudioChange('title', e.target.value)}
                  className="w-full bg-transparent border border-white/10 px-3 py-2 text-white text-xs font-body focus:outline-none focus:border-white/30 transition-colors" />
              </div>
              <div>
                <label className="block font-body text-[9px] text-gray-600 tracking-widest uppercase mb-1.5">Rua e Número</label>
                <input type="text" value={studio.street} onChange={(e) => handleStudioChange('street', e.target.value)}
                  className="w-full bg-transparent border border-white/10 px-3 py-2 text-white text-xs font-body focus:outline-none focus:border-white/30 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-body text-[9px] text-gray-600 tracking-widest uppercase mb-1.5">Cidade — UF</label>
                  <input type="text" value={studio.city} onChange={(e) => handleStudioChange('city', e.target.value)}
                    className="w-full bg-transparent border border-white/10 px-3 py-2 text-white text-xs font-body focus:outline-none focus:border-white/30 transition-colors" />
                </div>
                <div>
                  <label className="block font-body text-[9px] text-gray-600 tracking-widest uppercase mb-1.5">CEP</label>
                  <input type="text" value={studio.cep} onChange={(e) => handleStudioChange('cep', e.target.value)}
                    className="w-full bg-transparent border border-white/10 px-3 py-2 text-white text-xs font-body focus:outline-none focus:border-white/30 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block font-body text-[9px] text-gray-600 tracking-widest uppercase mb-1.5">Bairro / Label do Mapa</label>
                <input type="text" value={studio.mapLabel} onChange={(e) => handleStudioChange('mapLabel', e.target.value)}
                  className="w-full bg-transparent border border-white/10 px-3 py-2 text-white text-xs font-body focus:outline-none focus:border-white/30 transition-colors" />
              </div>
            </div>
          </div>

          <div className="border border-white/10 bg-black/20 p-5">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-4">Horários de Funcionamento</p>
            <div className="space-y-4">
              {studio.hours.map((h, i) => (
                <div key={i} className="space-y-2 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex gap-2">
                    <input type="text" value={h.days} onChange={(e) => handleHourChange(i, 'days', e.target.value)}
                      className="flex-1 bg-transparent border border-white/10 px-2 py-1.5 text-white text-[10px] font-body focus:outline-none focus:border-white/30 transition-colors" placeholder="Dias" />
                    <input type="text" value={h.time} onChange={(e) => handleHourChange(i, 'time', e.target.value)}
                      className="flex-1 bg-transparent border border-white/10 px-2 py-1.5 text-white text-[10px] font-body focus:outline-none focus:border-white/30 transition-colors" placeholder="Horário" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={h.closed} onChange={(e) => handleHourChange(i, 'closed', e.target.checked)}
                      className="rounded border-white/10 bg-transparent text-ink-500 focus:ring-offset-0 focus:ring-ink-500" />
                    <span className="font-body text-[9px] text-gray-600 uppercase tracking-widest">Destaque (fechado/especial)</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

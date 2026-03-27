import { useState, useRef } from 'react';
import { useStore } from '../../store';
import { applyCustomColors, generateShades } from '../../lib/themes';
import { uploadImage } from '../../lib/uploadImage';
import { TATTOO_STYLES } from '../../types';
import { getAnalytics, getTopPages, resetAnalytics } from '../../lib/analytics';


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

          const svgH = 60;
          const svgW = 100;
          const pad = { l: 0, r: 0, t: 6, b: 4 };
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
                  </svg>
                  {/* x-axis labels as HTML for readability */}
                  <div className="relative h-5 mt-1">
                    {labelIndices.map((i) => (
                      <span
                        key={i}
                        className="absolute font-mono text-[9px] text-white/50 -translate-x-1/2 select-none"
                        style={{ left: `${(i / (D - 1)) * 100}%` }}
                      >
                        {days[i].label}
                      </span>
                    ))}
                  </div>
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

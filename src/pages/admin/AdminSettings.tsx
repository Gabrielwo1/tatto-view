import { useStore } from '../../store';
import { THEMES, applyTheme, getThemeForHostname } from '../../lib/themes';
import type { ThemeId } from '../../lib/themes';

const THEME_ORDER: ThemeId[] = ['ember', 'crimson', 'violet', 'rose', 'gold', 'neon', 'cyan'];

export default function AdminSettings() {
  const themeId  = useStore((s) => s.themeId);
  const setTheme = useStore((s) => s.setTheme);

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
    </div>
  );
}

import { useStore } from '../../store';
import { THEMES, applyTheme, getThemeForHostname } from '../../lib/themes';
import type { ThemeId } from '../../lib/themes';

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

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8 md:mb-10">
        <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Estúdio</p>
        <h1 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wide leading-none">
          Configurações
        </h1>
      </div>

      {/* ── Aparência ── */}
      <section>
        <div className="mb-5">
          <h2 className="font-display text-xl uppercase tracking-wide text-white leading-none mb-1">
            Aparência
          </h2>
          <p className="font-body text-xs text-gray-500">
            Escolha a cor de destaque do site. A mudança é aplicada imediatamente.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.values(THEMES) as (typeof THEMES)[ThemeId][]).map((theme) => {
            const isActive = theme.id === active;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelect(theme.id)}
                className={`flex items-center gap-4 px-4 py-3.5 border text-left transition-all ${
                  isActive
                    ? 'border-white bg-white/5'
                    : 'border-white/10 hover:border-white/30 hover:bg-white/[0.03]'
                }`}
              >
                {/* Color swatch */}
                <span
                  className="w-8 h-8 rounded-full flex-shrink-0 transition-all"
                  style={{
                    backgroundColor: theme.accent,
                    boxShadow: isActive ? `0 0 0 2px #09090b, 0 0 0 4px ${theme.accent}` : 'none',
                  }}
                />

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <p className={`font-display text-base uppercase tracking-wide leading-none mb-0.5 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {theme.label}
                  </p>
                  <p className="font-body text-xs text-gray-600 truncate">{theme.description}</p>
                </div>

                {/* Active check */}
                {isActive && (
                  <svg className="w-4 h-4 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Reset */}
        {themeId !== null && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleReset}
              className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5"
            >
              Restaurar padrão do subdomínio
            </button>
          </div>
        )}

        {/* Preview indicator */}
        <div className="mt-6 px-4 py-3 border border-white/10 bg-black/30">
          <p className="font-body text-xs text-gray-500">
            Tema ativo:{' '}
            <span className="text-white font-semibold" style={{ color: THEMES[active].accent }}>
              {THEMES[active].label}
            </span>
            {themeId === null && (
              <span className="text-gray-700 ml-2">(padrão do subdomínio)</span>
            )}
          </p>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="my-10 border-t border-white/10" />

      {/* ── Informações do estúdio (read-only) ── */}
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

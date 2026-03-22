import { Link } from 'react-router-dom';
import { useStore } from '../store';

export default function SobreNosPage() {
  const c = useStore((s) => s.sobreNosContent);
  const { hero, collective, quote, studio } = c;

  const mapAddress = encodeURIComponent([studio.street, studio.city, studio.cep].filter(Boolean).join(', '));
  const mapSrc = `https://maps.google.com/maps?q=${mapAddress}&z=${studio.mapZoom || 15}&output=embed`;

  return (
    <div className="bg-zinc-900 text-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden">
        {/* background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black z-10" />
        {/* bg image placeholder — dark texture */}
        <div className="absolute inset-0 bg-zinc-900" />

        <div className="relative z-20 px-6 lg:px-20 py-16 lg:py-24 text-center w-full max-w-6xl mx-auto">
          {hero.estLabel && (
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-6">
              {hero.estLabel}
            </p>
          )}
          <h1 className="font-display text-6xl sm:text-7xl lg:text-9xl uppercase leading-none tracking-tight">
            {hero.title1}
            <br />
            {hero.title2}
          </h1>
          <div className="mt-6 w-12 h-0.5 bg-ink-500 mx-auto" />
          <p className="mt-6 max-w-sm text-white/60 font-body text-sm leading-relaxed mx-auto">
            {hero.description}
          </p>
        </div>
      </section>

      {/* ── WHO WE ARE ───────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-20 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Text */}
          <div>
            <h2 className="font-display text-4xl lg:text-5xl uppercase tracking-wide mb-8">
              {collective.title}
            </h2>
            <div className="space-y-5 text-white/60 font-body text-sm leading-relaxed">
              <p>{collective.body1}</p>
              <p>{collective.body2}</p>
              {collective.body3 && <p>{collective.body3}</p>}
            </div>
            <Link
              to="/artistas"
              className="inline-block mt-8 px-6 py-3 border border-white/30 font-body text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
            >
              {collective.ctaLabel}
            </Link>
          </div>

          {/* Studio image */}
          <div className="relative">
            <div className={`aspect-[3/4] bg-zinc-800 overflow-hidden flex items-center justify-center ml-auto ${
              collective.imageSize === 'sm'   ? 'max-w-xs w-full' :
              collective.imageSize === 'lg'   ? 'max-w-lg w-full' :
              collective.imageSize === 'full' ? 'w-full' :
                                                'max-w-sm w-full'
            }`}>
              {collective.image ? (
                <img
                  src={collective.image}
                  alt={collective.imageCaption || 'Estúdio'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-body text-[10px] tracking-widest uppercase text-white/20">
                  Imagem do Estúdio
                </span>
              )}
            </div>
            {collective.imageCaption && (
              <p className="mt-2 text-right font-body text-[10px] tracking-widest uppercase text-ink-500">
                {collective.imageCaption}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── DIVIDER IMAGE STRIP ──────────────────────────────────────────── */}
      <div className="w-full h-px bg-white/5" />

      {/* ── QUOTE ────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-20 py-20 lg:py-32 bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-ink-500 text-4xl font-serif leading-none mb-6">"</div>
          <blockquote className="font-display text-3xl sm:text-4xl lg:text-5xl uppercase leading-tight tracking-wide italic">
            {quote.replace(/^"|"$/g, '')}
          </blockquote>
        </div>
      </section>

      {/* ── THE STUDIO / MAP ─────────────────────────────────────────────── */}
      <section className="px-6 lg:px-20 py-20 lg:py-32 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Address + Hours */}
          <div>
            <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-wide text-ink-500 mb-8">
              {studio.title}
            </h2>

            <div className="mb-8">
              <p className="font-display text-xl uppercase tracking-wide">{studio.street}</p>
              <p className="font-display text-xl uppercase tracking-wide">{studio.city}</p>
              <p className="font-display text-xl uppercase tracking-wide">{studio.cep}</p>
            </div>

            <div>
              <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-4">
                Horários
              </p>
              <div className="space-y-3">
                {studio.hours.map((h, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span
                      className={`font-body text-sm font-semibold tracking-widest uppercase ${
                        h.closed ? 'text-ink-500' : 'text-white/70'
                      }`}
                    >
                      {h.days}
                    </span>
                    <span
                      className={`font-body text-sm tracking-widest ${
                        h.closed ? 'text-ink-500' : 'text-white/50'
                      }`}
                    >
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative">
            <div className="w-full aspect-square lg:aspect-[4/3] bg-zinc-800 overflow-hidden">
              <iframe
                src={mapSrc}
                title="Localização"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(0.9)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {studio.mapLabel && (
              <p className="mt-2 font-body text-[10px] tracking-widest uppercase text-white/30 text-center">
                {studio.mapLabel}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 px-6 lg:px-20 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-[10px] tracking-widest uppercase text-white/20">
            © 2024 El Dude Tattoo. Permanência pelo Design.
          </p>
          <div className="flex gap-6">
            {[
              { to: '/artistas', label: 'Artistas' },
              { to: '/sobre-nos', label: 'Estúdio' },
              { to: '/aftercare', label: 'Cuidados' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="font-body text-[10px] tracking-widest uppercase text-white/30 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

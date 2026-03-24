import { Link } from 'react-router-dom';
import { useStore } from '../store';

export default function SobreNosPage() {
  const c = useStore((s) => s.sobreNosContent);
  const artists = useStore((s) => s.artists);
  const { hero, collective, quote, studio, contact } = c;

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
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Text + photos grid */}
          <div className="flex flex-col">
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

            {/* 8 artist photos — pushed to the bottom to align with the large photo */}
            {artists.length > 0 && (
              <div className="mt-auto pt-10 grid grid-cols-4 gap-1.5">
                {artists.slice(0, 8).map((artist) => (
                  <div key={artist.id} className="aspect-square overflow-hidden bg-zinc-800">
                    <img
                      src={artist.photoUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${artist.id}/200/200`;
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
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
      <section className="px-6 lg:px-20 py-20 lg:py-32 bg-zinc-950 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <blockquote className="font-display text-3xl sm:text-5xl lg:text-6xl uppercase leading-tight tracking-wide italic whitespace-nowrap">
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

      {/* ── CONTATO & REDES SOCIAIS ───────────────────────────────────────── */}
      <section className="bg-zinc-950 border-t border-white/10 px-6 lg:px-20 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Contato */}
          <div>
            <h3 className="font-display text-xl uppercase tracking-widest text-white mb-6">Contato</h3>
            <div className="space-y-3 font-body text-sm text-white/60">
              {contact.email && (
                <p>
                  Você pode entrar em contato pelo e-mail:{' '}
                  <a href={`mailto:${contact.email}`} className="text-ink-500 hover:text-white transition-colors underline underline-offset-2">
                    {contact.email}
                  </a>
                </p>
              )}
              {(contact.phone1 || contact.phone2) && (
                <p>
                  Telefones de contato:{' '}
                  {contact.phone1 && (
                    <a href={contact.phone1Url || `tel:${contact.phone1}`} className="text-ink-500 hover:text-white transition-colors underline underline-offset-2">
                      {contact.phone1}
                    </a>
                  )}
                  {contact.phone1 && contact.phone2 && <span> e </span>}
                  {contact.phone2 && (
                    <a href={contact.phone2Url || `tel:${contact.phone2}`} className="text-ink-500 hover:text-white transition-colors underline underline-offset-2">
                      {contact.phone2}
                    </a>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="font-display text-xl uppercase tracking-widest text-white mb-6">Redes Sociais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contact.instagram && (
                <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-ink-500 hover:text-white transition-colors font-body text-sm group">
                  {/* Instagram icon */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                  </svg>
                  {contact.instagram}
                </a>
              )}
              {contact.tiktok && (
                <a href={contact.tiktokUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-ink-500 hover:text-white transition-colors font-body text-sm group">
                  {/* TikTok icon */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                  </svg>
                  {contact.tiktok}
                </a>
              )}
              {contact.twitter && (
                <a href={contact.twitterUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-ink-500 hover:text-white transition-colors font-body text-sm group">
                  {/* Twitter/X icon */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  {contact.twitter}
                </a>
              )}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

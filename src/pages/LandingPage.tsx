import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

import { toSlug, interleaveByArtist } from '../utils';
import GeneralLightbox from '../components/GeneralLightbox';


/* ─── tiny hook: element is visible ─── */
function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function LandingPage() {
  const tattoos  = useStore((s) => s.tattoos);
  const artists  = useStore((s) => s.artists);
  const lc       = useStore((s) => s.landingContent);
  const c        = useStore((s) => s.sobreNosContent);
  const [faqOpen, setFaqOpen]           = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const available = useMemo(
    () => interleaveByArtist(tattoos.filter((t) => t.status === 'available')).slice(0, 15),
    [tattoos]
  );

  /* section visibility hooks */
  const { ref: sobreRef,    visible: sobreVisible }    = useVisible();

  const { ref: teamRef,     visible: teamVisible }     = useVisible();
  const { ref: galeriaRef,  visible: galeriaVisible }  = useVisible();
  const { ref: processoRef, visible: processoVisible } = useVisible();
  const { ref: faqRef,      visible: faqVisible }      = useVisible();
  const { ref: quemSomosRef, visible: quemSomosVisible } = useVisible();
  const { ref: quoteRef,    visible: quoteVisible }    = useVisible();
  const { ref: estudioRef,  visible: estudioVisible }  = useVisible();

  // Safety check for persisted content
  if (!lc || !lc.hero || !lc.manifesto || !lc.processo || !lc.faq || !lc.cta) {
    return <div className=\"min-h-screen bg-zinc-900 flex items-center justify-center text-white/20 font-display uppercase tracking-widest text-sm\">Carregando...</div>;
  }

  const { collective, quote, studio, contact } = c;
  const mapAddress = encodeURIComponent([studio.street, studio.city, studio.cep].filter(Boolean).join(', '));
  const mapSrc = `https://maps.google.com/maps?q=${mapAddress}&z=${studio.mapZoom || 15}&output=embed`;

  return (
    <div className=\"bg-zinc-900 text-white overflow-x-hidden\">

      {selectedImage && (
        <GeneralLightbox imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section className=\"relative min-h-[80vh] flex flex-col items-center justify-start text-center px-6 pt-20 md:pt-24 pb-14 overflow-hidden\">
        {/* Noise texture overlay */}
        <div className=\"absolute inset-0 opacity-[0.03] pointer-events-none\"
          style={{ backgroundImage: 'url(\"data:image/svg+xml,%3Csvg viewBox=\\'0 0 256 256\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'n\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.9\\' numOctaves=\\'4\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23n)\\'/%3E%3C/svg%3E\")' }} />

        {/* Faint horizontal rule lines */}
        <div className=\"absolute inset-0 pointer-events-none\" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.025) 80px)' }} />

        {/* Tagline */}
        <h1 className=\"font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white uppercase tracking-tight leading-none mb-4\">
          {lc.hero.tagline.split('\\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </h1>
        <p className=\"font-body text-base md:text-xl text-gray-400 max-w-xl mb-8 leading-relaxed\">
          {lc.hero.description.split('\\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </p>

        {/* CTAs */}
        <div className=\"flex flex-col sm:flex-row gap-4 items-center\">
          <Link
            to=\"/\"
            className=\"px-10 py-4 bg-white hover:bg-gray-100 text-black font-body font-bold text-sm tracking-widest uppercase transition-colors\"
          >
            Ver portfólio
          </Link>
          <a
            href=\"#contato\"
            className=\"px-10 py-4 border border-white/30 hover:border-white text-white/70 hover:text-white font-body font-bold text-sm tracking-widest uppercase transition-colors\"
          >
            Falar com artista
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MANIFESTO / SOBRE
      ══════════════════════════════════════════════════ */}
      <section className=\"bg-zinc-950 py-20 px-6\">
        <div
          ref={sobreRef}
          className={`max-w-4xl mx-auto transition-all duration-700 ${sobreVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className=\"font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4\">Manifesto</p>
          <h2 className=\"font-display text-5xl sm:text-7xl md:text-8xl uppercase leading-none text-white mb-8\">
            {lc.manifesto.title1}<br />{lc.manifesto.title2}
          </h2>
          <div className=\"grid md:grid-cols-2 gap-8 text-gray-400 font-body text-base leading-relaxed\">
            <p>{lc.manifesto.body1}</p>
            <p>{lc.manifesto.body2}</p>
          </div>

          {/* Stats */}
          <div className=\"grid grid-cols-3 gap-px mt-10 border border-white/10\">
            {[
              { n: `${artists.length}+`, label: 'Artistas' },
              { n: `${tattoos.length}+`, label: 'Artes realizadas' },
              { n: '8',                 label: 'Estilos' },
            ].map(({ n, label }) => (
              <div key={label} className=\"bg-zinc-950 p-8 text-center\">
                <p className=\"font-display text-5xl md:text-6xl text-white leading-none mb-2\">{n}</p>
                <p className=\"font-body text-xs tracking-widest uppercase text-gray-600\">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ══════════════════════════════════════════════════
          ARTISTAS
      ══════════════════════════════════════════════════ */}
      <section className=\"bg-zinc-950 py-20 px-6\">
        <div className=\"max-w-6xl mx-auto\">
          <div
            ref={teamRef}
            className={`mb-12 transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <p className=\"font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4\">A equipe</p>
            <h2 className=\"font-display text-5xl sm:text-7xl uppercase leading-none text-white\">
              Conheça os<br />artistas
            </h2>
          </div>

          <div className=\"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px border border-white/10\">
            {artists.map((artist, i) => (
              <Link
                key={artist.id}
                to={`/artistas/${toSlug(artist.name)}`}
                className={`group relative overflow-hidden aspect-[2/3] bg-zinc-900 block transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <img
                  src={artist.photoUrl}
                  alt={artist.name}
                  className=\"w-full h-full object-cover group-hover:scale-105 transition-transform duration-700\"
                  loading=\"lazy\"
                  decoding=\"async\"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${artist.id}/400/600`; }}
                />
                {/* Gradient overlay */}
                <div className=\"absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent\" />
                <div className=\"absolute bottom-0 left-0 right-0 p-4\">
                  <p className=\"font-display text-lg uppercase tracking-wide text-white leading-tight\">{artist.name}</p>
                  {artist.specialties.length > 0 && (
                    <p className=\"font-body text-xs tracking-widest uppercase text-gray-400 mt-1\">
                      {artist.specialties.slice(0, 2).join(' · ')}
                    </p>\n                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className=\"mt-8 text-center\">
            <Link
              to=\"/artistas\"
              className=\"inline-block px-10 py-3 border border-white/20 hover:border-white text-gray-500 hover:text-white font-body font-bold text-xs tracking-widest uppercase transition-colors\"
            >
              Ver todos os artistas →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PORTFÓLIO PREVIEW
      ══════════════════════════════════════════════════ */}
      <section className=\"bg-black py-20 px-6\">
        <div className=\"max-w-6xl mx-auto\">
          <div
            ref={galeriaRef}
            className={`mb-12 flex items-end justify-between transition-all duration-700 ${galeriaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <div>
              <p className=\"font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4\">Portfólio</p>\n              <h2 className=\"font-display text-5xl sm:text-7xl uppercase leading-none text-white\">
                Artes<br />recentes
              </h2>
            </div>
            <Link
              to=\"/\"
              className=\"hidden sm:block font-body text-xs font-bold tracking-widest uppercase text-gray-600 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5\"
            >\n              Ver vitrine completa →\n            </Link>
          </div>

          {available.length > 0 ? (
            <div className=\"grid grid-cols-2 sm:grid-cols-5 gap-px border border-white/10\">
              {available.map((tattoo, i) => (
                  <Link
                    key={tattoo.id}
                    to=\"/\"
                    className={`group relative overflow-hidden aspect-[3/4] bg-zinc-900 block transition-all duration-700 ${galeriaVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    <img
                      src={tattoo.imageUrl}
                      alt={tattoo.title}
                      className=\"w-full h-full object-cover group-hover:scale-105 transition-transform duration-700\"
                      loading=\"lazy\"
                      decoding=\"async\"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tattoo.id}/400/600`; }}
                    />
                    <div className=\"absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300\" />
                    <div className=\"absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300\">
                      <p className=\"font-display text-base uppercase tracking-wide text-white\">{tattoo.title}</p>\n                      <p className=\"font-body text-xs tracking-widest uppercase text-gray-400\">{tattoo.style}</p>\n                      {tattoo.price && <p className=\"font-body text-sm text-white mt-1\">{tattoo.price}</p>}\n                    </div>
                  </Link>
              ))}\n            </div>
          ) : (
            <div className=\"text-center py-20 border border-white/10\">
              <p className=\"font-display text-2xl uppercase tracking-widest text-gray-700\">Portfólio em construção</p>
            </div>
          )}

          <div className=\"mt-8 text-center sm:hidden\">
            <Link to=\"/\" className=\"font-body text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-white transition-colors\">
              Ver vitrine completa →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          COMO FUNCIONA
      ══════════════════════════════════════════════════ */}
      <section className=\"bg-zinc-950 py-20 px-6\">
        <div className=\"max-w-4xl mx-auto\">\n          <div
            ref={processoRef}
            className={`mb-12 transition-all duration-700 ${processoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <p className=\"font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4\">Processo</p>\n            <h2 className=\"font-display text-5xl sm:text-7xl uppercase leading-none text-white\">
              Do sonho<br />à pele
            </h2>
          </div>

          <div className=\"space-y-px\">\n            {lc.processo.map(({ n, title, desc }, i) => (
              <div
                key={n}
                className={`flex gap-8 p-8 bg-black border-l-2 border-transparent hover:border-ink-500 hover:bg-zinc-950 transition-all duration-500 group ${processoVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <span className=\"font-display text-5xl text-white/10 group-hover:text-ink-500/30 transition-colors leading-none flex-shrink-0 w-14\">{n}</span>
                <div>
                  <h3 className=\"font-display text-2xl uppercase tracking-wide text-white mb-2\">{title}</h3>
                  <p className=\"font-body text-sm text-gray-500 leading-relaxed\">{desc}</p>
                </div>
              </div>
            ))}\n          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════ */}
      <section className=\"bg-zinc-950 py-20 px-6\">
        <div className=\"max-w-3xl mx-auto\">\n          <div
            ref={faqRef}
            className={`mb-12 transition-all duration-700 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <p className=\"font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4\">Dúvidas</p>\n            <h2 className=\"font-display text-5xl sm:text-7xl uppercase leading-none text-white\">
              Perguntas<br />frequentes
            </h2>
          </div>

          <div className=\"space-y-px\">\n            {lc.faq.map(({ q, a }, i) => (
              <div key={i} className=\"border-b border-white/10\">\n                <button
                  type=\"button\"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className=\"w-full flex items-center justify-between py-5 text-left group\"\n                >\n                  <span className=\"font-body font-semibold text-sm text-white group-hover:text-gray-200 pr-8\">{q}</span>
                  <span className={`font-display text-2xl text-ink-500 flex-shrink-0 transition-transform duration-300 ${faqOpen === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${faqOpen === i ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                  <p className=\"font-body text-sm text-gray-500 leading-relaxed\">{a}</p>\n                </div>
              </div>
            ))}\n          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          QUEM SOMOS (from SobreNós)
      ══════════════════════════════════════════════════ */}
      <section className=\"bg-black py-20 px-6 lg:px-20\">
        <div
          ref={quemSomosRef}
          className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch transition-all duration-700 ${quemSomosVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div className=\"flex flex-col h-full\">
            <div>
              <p className=\"font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4\">O Coletivo</p>\n              <h2 className=\"font-display text-4xl lg:text-5xl uppercase tracking-wide mb-8\">
                {collective.title}
              </h2>
              <div className=\"space-y-5 text-white/60 font-body text-sm leading-relaxed\">\n                <p>{collective.body1}</p>\n                <p>{collective.body2}</p>\n                {collective.body3 && <p>{collective.body3}</p>}\n              </div>
              <Link
                to=\"/artistas\"
                className=\"inline-block mt-8 px-6 py-3 border border-white/30 font-body text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors\"
              >
                {collective.ctaLabel}
              </Link>
            </div>

            {collective.galleryImages?.some(Boolean) && (
              <div className=\"mt-auto pt-10 grid grid-cols-3 gap-1.5\">\n                {collective.galleryImages.map((img, i) =>\n                  img ? (\n                    <div key={i} className=\"aspect-square bg-zinc-800 overflow-hidden cursor-zoom-in\" onClick={() => setSelectedImage(img)}>\n                      <img src={img} alt={`Galeria ${i + 1}`} className=\"w-full h-full object-cover hover:scale-105 transition-transform duration-500\" />\n                    </div>\n                  ) : null\n                )}\n              </div>
            )}
          </div>

          <div className=\"relative\">\n            <div className={`aspect-[3/4] bg-zinc-800 overflow-hidden flex items-center justify-center ml-auto ${\n              collective.imageSize === 'sm'   ? 'max-w-xs w-full' :\n              collective.imageSize === 'lg'   ? 'max-w-lg w-full' :\n              collective.imageSize === 'full' ? 'w-full' :\n                                                'max-w-sm w-full'\n            }`}>\n              {collective.image ? (\n                <img\n                  src={collective.image}\n                  alt={collective.imageCaption || 'Estúdio'}\n                  className=\"w-full h-full object-cover cursor-zoom-in\"\n                  onClick={() => setSelectedImage(collective.image!)}\n                />\n              ) : (\n                <span className=\"font-body text-[10px] tracking-widest uppercase text-white/20\">Imagem do Estúdio</span>\n              )}\n            </div>\n            {collective.imageCaption && (\n              <p className=\"mt-2 text-right font-body text-[10px] tracking-widest uppercase text-ink-500\">\n                {collective.imageCaption}
              </p>\n            )}\n          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          QUOTE (from SobreNós)
      ══════════════════════════════════════════════════ */}
      <section className=\"px-6 lg:px-20 py-14 lg:py-24 bg-zinc-950 overflow-hidden\">
        <div
          ref={quoteRef}
          className={`max-w-6xl mx-auto text-center transition-all duration-700 ${quoteVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <blockquote className=\"font-display text-3xl sm:text-5xl lg:text-6xl uppercase leading-tight tracking-wide italic\">\n            {quote.replace(/^\"|\"$/g, '')}\n          </blockquote>
        </div>\n      </section>

      {/* ══════════════════════════════════════════════════
          ESTÚDIO / MAPA (from SobreNós)
      ══════════════════════════════════════════════════ */}
      <section className=\"px-6 lg:px-20 py-14 lg:py-24 bg-zinc-900/50\">
        <div
          ref={estudioRef}
          className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start transition-all duration-700 ${estudioVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div>
            <h2 className=\"font-display text-3xl lg:text-4xl uppercase tracking-wide text-ink-500 mb-8\">\n              {studio.title}\n            </h2>
            <div className=\"mb-8\">\n              <p className=\"font-display text-xl uppercase tracking-wide\">{studio.street}</p>\n              <p className=\"font-display text-xl uppercase tracking-wide\">{studio.city}</p>\n              <p className=\"font-display text-xl uppercase tracking-wide\">{studio.cep}</p>\n            </div>\n            <div>
              <p className=\"font-body text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-4\">Horários</p>\n              <div className=\"space-y-3\">\n                {studio.hours.map((h, i) => (\n                  <div key={i} className=\"flex items-center justify-between border-b border-white/5 pb-3\">\n                    <span className={`font-body text-sm font-semibold tracking-widest uppercase ${h.closed ? 'text-ink-500' : 'text-white/70'}`}>\n                      {h.days}\n                    </span>\n                    <span className={`font-body text-sm tracking-widest ${h.closed ? 'text-ink-500' : 'text-white/50'}`}>\n                      {h.time}\n                    </span>\n                  </div>\n                ))}\n              </div>\n            </div>\n          </div>

          <div className=\"relative\">\n            <div className=\"w-full aspect-square lg:aspect-[4/3] bg-zinc-800 overflow-hidden\">\n              <iframe
                src={mapSrc}\n                title=\"Localização\"
                width=\"100%\"\n                height=\"100%\"
                style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(0.9)' }}\n                allowFullScreen
                loading=\"lazy\"\n                referrerPolicy=\"no-referrer-when-downgrade\"
              />\n            </div>
            {studio.mapLabel && (
              <p className=\"mt-2 font-body text-[10px] tracking-widest uppercase text-white/30 text-center\">\n                {studio.mapLabel}
              </p>\n            )}\n          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CONTATO & REDES SOCIAIS (from SobreNós)
      ══════════════════════════════════════════════════ */}
      <section className=\"bg-zinc-950 border-t border-white/10 px-6 lg:px-20 py-14 lg:py-20\">
        <div className=\"max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20\">\n          <div>
            <h3 className=\"font-display text-xl uppercase tracking-widest text-white mb-6\">Contato</h3>\n            <div className=\"space-y-3 font-body text-sm text-white/60\">\n              {contact.email && (\n                <p>
                  Você pode entrar em contato pelo e-mail:{' '}\n                  <a href={`mailto:${contact.email}`} className=\"text-ink-500 hover:text-white transition-colors underline underline-offset-2\">\n                    {contact.email}\n                  </a>\n                </p>\n              )}\n              {(contact.phone1 || contact.phone2) && (\n                <p>
                  Telefones de contato:{' '}\n                  {contact.phone1 && (\n                    <a href={contact.phone1Url || `tel:${contact.phone1}`} className=\"text-ink-500 hover:text-white transition-colors underline underline-offset-2\">\n                      {contact.phone1}\n                    </a>\n                  )}\n                  {contact.phone1 && contact.phone2 && <span> e </span>}\n                  {contact.phone2 && (\n                    <a href={contact.phone2Url || `tel:${contact.phone2}`} className=\"text-ink-500 hover:text-white transition-colors underline underline-offset-2\">\n                      {contact.phone2}\n                    </a>\n                  )}\n                </p>\n              )}\n            </div>\n          </div>

          <div>
            <h3 className=\"font-display text-xl uppercase tracking-widest text-white mb-6\">Redes Sociais</h3>\n            <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-3\">\n              {contact.instagram && (\n                <a href={contact.instagramUrl} target=\"_blank\" rel=\"noopener noreferrer\"\n                  className=\"flex items-center gap-3 text-ink-500 hover:text-white transition-colors font-body text-sm\">\n                  <svg className=\"w-5 h-5 shrink-0\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.5\">\n                    <rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"5\" ry=\"5\"/>\n                    <circle cx=\"12\" cy=\"12\" r=\"4\"/>\n                    <circle cx=\"17.5\" cy=\"6.5\" r=\"0.5\" fill=\"currentColor\"/>\n                  </svg>\n                  {contact.instagram}\n                </a>\n              )}\n              {contact.tiktok && (\n                <a href={contact.tiktokUrl} target=\"_blank\" rel=\"noopener noreferrer\"\n                  className=\"flex items-center gap-3 text-ink-500 hover:text-white transition-colors font-body text-sm\">\n                  <svg className=\"w-4 h-4 shrink-0\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n                    <path d=\"M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z\"/>\n                  </svg>\n                  {contact.tiktok}\n                </a>\n              )}\n              {contact.twitter && (\n                <a href={contact.twitterUrl} target=\"_blank\" rel=\"noopener noreferrer\"\n                  className=\"flex items-center gap-3 text-ink-500 hover:text-white transition-colors font-body text-sm\">\n                  <svg className=\"w-5 h-5 shrink-0\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n                    <path d=\"M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z\"/>\n                  </svg>\n                  {contact.twitter}\n                </a>\n              )}\n            </div>\n          </div>\n        </div>\n      </section>\n\n      {/* ══════════════════════════════════════════════════\n          CTA FINAL / CONTATO\n      ══════════════════════════════════════════════════ */}\n      <section id=\"contato\" className=\"bg-black py-22 px-6 text-center relative overflow-hidden\">\n        <p className=\"absolute inset-0 flex items-center justify-center font-display text-[20vw] text-white/[0.02] uppercase leading-none select-none pointer-events-none\">\n          El Dude\n        </p>\n\n        <div className=\"relative z-10 max-w-2xl mx-auto\">\n          <p className=\"font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-6\">{lc.cta.tagline}</p>\n          <h2 className=\"font-display text-5xl sm:text-8xl md:text-9xl uppercase leading-none text-white mb-8\">\n            {lc.cta.title1}<br />{lc.cta.title2}\n          </h2>\n          <p className=\"font-body text-base text-gray-500 mb-12 leading-relaxed\">\n            {lc.cta.description}\n          </p>\n\n          <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">\n            <Link\n              to=\"/artistas\"\n              className=\"px-12 py-4 bg-white hover:bg-gray-100 text-black font-body font-bold text-sm tracking-widest uppercase transition-colors\"\n            >\n              Escolher artista\n            </Link>\n            <Link\n              to=\"/\"\n              className=\"px-12 py-4 border border-white/25 hover:border-white text-white/60 hover:text-white font-body font-bold text-sm tracking-widest uppercase transition-colors\"\n            >\n              Ver portfólio\n            </Link>\n          </div>\n        </div>\n      </section>\n\n    </div>\n  );\n}\n
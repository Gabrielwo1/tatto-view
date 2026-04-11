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

  if (!lc || !lc.hero || !lc.manifesto || !lc.processo || !lc.faq || !lc.cta) {
    return <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-white/20 font-display uppercase tracking-widest text-sm">Carregando...</div>;
  }

  const { collective, quote, studio, contact } = c;
  const mapAddress = encodeURIComponent([studio.street, studio.city, studio.cep].filter(Boolean).join(', '));
  const mapSrc = `https://maps.google.com/maps?q=${mapAddress}&z=${studio.mapZoom || 15}&output=embed`;

  return (
    <div className="bg-zinc-900 text-white overflow-x-hidden">
      {selectedImage && (
        <GeneralLightbox imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      {/* HERO */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-start text-center px-6 pt-20 md:pt-24 pb-14 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.025) 80px)' }} />

        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white uppercase tracking-tight leading-none mb-4">
          {lc.hero.tagline.split(/\n+/).map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </h1>
        <p className="font-body text-base md:text-xl text-gray-400 max-w-xl mb-8 leading-relaxed">
          {lc.hero.description.split(/\n+/).map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link to="/" className="px-10 py-4 bg-white hover:bg-gray-100 text-black font-body font-bold text-sm tracking-widest uppercase transition-colors">
            Ver vitrine
          </Link>
          <a href="#contato" className="px-10 py-4 border border-white/30 hover:border-white text-white/70 hover:text-white font-body font-bold text-sm tracking-widest uppercase transition-colors">
            Falar com artista
          </a>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="bg-zinc-950 py-20 px-6">
        <div ref={sobreRef} className={`max-w-4xl mx-auto transition-all duration-700 ${sobreVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">Manifesto</p>
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl uppercase leading-none text-white mb-8">
            {lc.manifesto.title1}<br />{lc.manifesto.title2}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-gray-400 font-body text-base leading-relaxed">
            <p>{lc.manifesto.body1}</p>
            <p>{lc.manifesto.body2}</p>
          </div>
          <div className="grid grid-cols-3 gap-px mt-10 border border-white/10">
            {[
              { n: `${artists.length}+`, label: 'Artistas' },
              { n: `${tattoos.length}+`, label: 'Artes realizadas' },
              { n: '8', label: 'Estilos' },
            ].map(({ n, label }) => (
              <div key={label} className="bg-zinc-950 p-8 text-center">
                <p className="font-display text-5xl md:text-6xl text-white leading-none mb-2">{n}</p>
                <p className="font-body text-xs tracking-widest uppercase text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA */}
      {available.length > 0 && (
        <section className="bg-zinc-900 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div ref={galeriaRef} className={`mb-12 transition-all duration-700 ${galeriaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">Portfólio</p>
              <h2 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white">
                Nossas<br />obras
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1">
              {available.map((tattoo, i) => (
                <div
                  key={tattoo.id}
                  className={`aspect-square overflow-hidden cursor-pointer transition-all duration-700 ${galeriaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${i * 40}ms` }}
                  onClick={() => setSelectedImage(tattoo.imageUrl)}
                >
                  <img
                    src={tattoo.imageUrl}
                    alt={tattoo.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link to="/" className="inline-block px-10 py-4 border border-white/25 hover:border-white text-white/60 hover:text-white font-body font-bold text-sm tracking-widest uppercase transition-colors">
                Ver vitrine completa
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ARTISTAS */}
      <section className="bg-zinc-950 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div ref={teamRef} className={`mb-12 transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">A equipe</p>
            <h2 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white">
              Conheça os<br />artistas
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-px border border-white/10">
            {artists.map((artist, i) => (
              <Link key={artist.id} to={`/artistas/${toSlug(artist.name)}`}
                className={`group relative overflow-hidden aspect-[3/4] bg-zinc-900 block transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <img src={artist.photoUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display text-lg uppercase tracking-wide text-white leading-tight">{artist.name}</p>
                  {artist.specialties.length > 0 && (
                    <p className="font-body text-xs tracking-widest uppercase text-gray-400 mt-1">{artist.specialties.slice(0, 2).join(' · ')}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE NÓS — coletivo */}
      <section className="bg-zinc-900 py-20 px-6">
        <div ref={quemSomosRef} className={`max-w-6xl mx-auto transition-all duration-700 ${quemSomosVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Esquerda: texto + mini galeria */}
            <div>
              <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">Sobre nós</p>
              <h2 className="font-display text-5xl sm:text-6xl md:text-7xl uppercase leading-none text-white mb-8">
                {collective.title}
              </h2>
              <div className="space-y-4 text-gray-400 font-body text-base leading-relaxed mb-8">
                <p>{collective.body1}</p>
                {collective.body2 && <p>{collective.body2}</p>}
                {collective.body3 && <p>{collective.body3}</p>}
              </div>
              <Link to="/artistas" className="inline-block px-10 py-4 border border-white/25 hover:border-white text-white/60 hover:text-white font-body font-bold text-sm tracking-widest uppercase transition-colors mb-8">
                {collective.ctaLabel}
              </Link>
              {/* Mini galeria */}
              {collective.galleryImages?.some(img => img) && (
                <div className="grid grid-cols-3 gap-1 mt-8">
                  {collective.galleryImages.filter(img => img).map((img, i) => (
                    <div key={i} className="aspect-square overflow-hidden cursor-pointer" onClick={() => setSelectedImage(img)}>
                      <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Direita: foto grande */}
            {collective.image && (
              <div className="cursor-pointer overflow-hidden sticky top-24" onClick={() => setSelectedImage(collective.image)}>
                <img src={collective.image} alt={collective.imageCaption || ''} className="w-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                {collective.imageCaption && (
                  <p className="font-body text-xs tracking-widest uppercase text-gray-600 mt-2">{collective.imageCaption}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      {quote && (
        <section className="bg-black py-24 px-6 text-center">
          <div ref={quoteRef} className={`max-w-3xl mx-auto transition-all duration-700 ${quoteVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="font-display text-3xl sm:text-5xl md:text-6xl text-white uppercase leading-tight tracking-tight">
              {quote}
            </p>
          </div>
        </section>
      )}

      {/* PROCESSO */}
      <section className="bg-zinc-950 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div ref={processoRef} className={`mb-12 transition-all duration-700 ${processoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">Como funciona</p>
            <h2 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white">
              O processo
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-px border border-white/10">
            {lc.processo.map((step, i) => (
              <div
                key={step.n}
                className={`bg-zinc-950 p-8 transition-all duration-700 ${processoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <p className="font-display text-6xl text-white/10 leading-none mb-4">{step.n}</p>
                <p className="font-display text-2xl uppercase text-white mb-3">{step.title}</p>
                <p className="font-body text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-900 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div ref={faqRef} className={`mb-12 transition-all duration-700 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">Dúvidas</p>
            <h2 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white">
              Perguntas<br />frequentes
            </h2>
          </div>
          <div className={`divide-y divide-white/10 border-y border-white/10 transition-all duration-700 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {lc.faq.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full text-left py-5 flex items-center justify-between gap-4 group"
                >
                  <span className="font-body text-sm font-semibold tracking-wide text-white group-hover:text-ink-400 transition-colors">{item.q}</span>
                  <span className="font-display text-xl text-gray-500 flex-shrink-0">{faqOpen === i ? '−' : '+'}</span>
                </button>
                {faqOpen === i && (
                  <p className="font-body text-sm text-gray-400 leading-relaxed pb-5">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESTÚDIO & CONTATO */}
      <section id="contato" className="bg-zinc-950 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div ref={estudioRef} className={`mb-12 transition-all duration-700 ${estudioVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">Localização</p>
            <h2 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white">
              {studio.title || 'O estúdio'}
            </h2>
          </div>
          <div className={`grid md:grid-cols-2 gap-12 transition-all duration-700 ${estudioVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '150ms' }}>
            {/* Info */}
            <div className="space-y-8">
              {/* Endereço */}
              <div>
                <p className="font-body text-[10px] font-bold tracking-widest uppercase text-gray-600 mb-2">Endereço</p>
                <p className="font-body text-sm text-gray-300">{studio.street}</p>
                <p className="font-body text-sm text-gray-300">{studio.city}</p>
                {studio.mapLabel && <p className="font-body text-xs text-gray-500 mt-1">{studio.mapLabel}</p>}
              </div>

              {/* Horários */}
              {studio.hours && studio.hours.length > 0 && (
                <div>
                  <p className="font-body text-[10px] font-bold tracking-widest uppercase text-gray-600 mb-2">Horários</p>
                  <div className="space-y-1">
                    {studio.hours.map((h, i) => (
                      <div key={i} className="flex justify-between gap-4">
                        <span className="font-body text-sm text-gray-400">{h.days}</span>
                        <span className={`font-body text-sm ${h.closed ? 'text-gray-600' : 'text-gray-300'}`}>{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contato */}
              <div>
                <p className="font-body text-[10px] font-bold tracking-widest uppercase text-gray-600 mb-2">Contato</p>
                <div className="space-y-2">
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="block font-body text-sm text-gray-400 hover:text-white transition-colors">{contact.email}</a>
                  )}
                  {contact.phone1 && (
                    <a href={contact.phone1Url || `tel:${contact.phone1}`} className="block font-body text-sm text-gray-400 hover:text-white transition-colors">{contact.phone1}</a>
                  )}
                  {contact.instagram && (
                    <a href={contact.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="block font-body text-sm text-gray-400 hover:text-white transition-colors">{contact.instagram}</a>
                  )}
                  {contact.tiktok && (
                    <a href={contact.tiktokUrl || '#'} target="_blank" rel="noopener noreferrer" className="block font-body text-sm text-gray-400 hover:text-white transition-colors">{contact.tiktok}</a>
                  )}
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="aspect-square md:aspect-auto">
              <iframe
                src={mapSrc}
                title="Localização do estúdio"
                className="w-full h-full min-h-[300px] border-0 grayscale opacity-80"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTAs FINAL */}
      <section className="bg-black py-24 px-6 text-center relative overflow-hidden">
        <p className="absolute inset-0 flex items-center justify-center font-display text-[20vw] text-white/[0.02] uppercase leading-none select-none pointer-events-none">El Dude</p>
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-6">{lc.cta.tagline}</p>
          <h2 className="font-display text-5xl sm:text-8xl md:text-9xl uppercase leading-none text-white mb-8">
            {lc.cta.title1}<br />{lc.cta.title2}
          </h2>
          <p className="font-body text-base text-gray-500 mb-12 leading-relaxed">{lc.cta.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/artistas" className="px-12 py-4 bg-white hover:bg-gray-100 text-black font-body font-bold text-sm tracking-widest uppercase transition-colors">
              Escolher artista
            </Link>
            <Link to="/" className="px-12 py-4 border border-white/25 hover:border-white text-white/60 hover:text-white font-body font-bold text-sm tracking-widest uppercase transition-colors">
              Ver vitrine
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

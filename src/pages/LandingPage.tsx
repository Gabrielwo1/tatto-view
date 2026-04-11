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
          {lc.hero.tagline.split(/[\\n\n]+/).map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </h1>
        <p className="font-body text-base md:text-xl text-gray-400 max-w-xl mb-8 leading-relaxed">
          {lc.hero.description.split(/[\\n\n]+/).map((line, i, arr) => (
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

      {/* ARTISTAS */}
      <section className="bg-zinc-950 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div ref={teamRef} className={`mb-12 transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">A equipe</p>
            <h2 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white">
              Conheça os<br />artistas
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px border border-white/10">
            {artists.map((artist, i) => (
              <Link key={artist.id} to={`/artistas/${toSlug(artist.name)}`} 
                className={`group relative overflow-hidden aspect-[2/3] bg-zinc-900 block transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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

      {/* CTAs FINAL */}
      <section id="contato" className="bg-black py-24 px-6 text-center relative overflow-hidden">
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

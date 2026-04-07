import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { TATTOO_STYLES } from '../types';
import { toSlug, interleaveByArtist } from '../utils';


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
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
  const lc = useStore((s) => s.landingContent);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const available = useMemo(
    () => interleaveByArtist(tattoos.filter((t) => t.status === 'available')).slice(0, 15),
    [tattoos]
  );

  /* section visibility hooks */
  const { ref: sobreRef,    visible: sobreVisible }    = useVisible();
  const { ref: estilosRef,  visible: estilosVisible }  = useVisible();
  const { ref: teamRef,     visible: teamVisible }     = useVisible();
  const { ref: galeriaRef,  visible: galeriaVisible }  = useVisible();
  const { ref: processoRef, visible: processoVisible } = useVisible();
  const { ref: precosRef,   visible: precosVisible }   = useVisible();
  const { ref: faqRef,      visible: faqVisible }      = useVisible();

  // Safety check for persisted content
  if (!lc || !lc.hero || !lc.manifesto || !lc.processo || !lc.precos || !lc.faq || !lc.cta) {
    return <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-white/20 font-display uppercase tracking-widest text-sm">Carregando...</div>;
  }

  return (
    <div className="bg-zinc-900 text-white overflow-x-hidden">

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative min-h-[82vh] flex flex-col items-center justify-start text-center px-6 pt-20 sm:pt-24 md:pt-28 pb-14 overflow-hidden">
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        {/* Faint horizontal rule lines */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.025) 80px)' }} />

        {/* Tagline */}
        <h1 className="font-display text-5xl sm:text-8xl md:text-[10rem] lg:text-[12rem] text-white uppercase tracking-tight leading-none mb-4">
          {lc.hero.tagline.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </h1>
        <p className="font-body text-base md:text-xl text-gray-400 max-w-xl mb-8 leading-relaxed">
          {lc.hero.description.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            to="/"
            className="px-10 py-4 bg-white hover:bg-gray-100 text-black font-body font-bold text-sm tracking-widest uppercase transition-colors"
          >
            Ver portfólio
          </Link>
          <a
            href="#contato"
            className="px-10 py-4 border border-white/30 hover:border-white text-white/70 hover:text-white font-body font-bold text-sm tracking-widest uppercase transition-colors"
          >
            Falar com artista
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-30">
          <span className="font-body text-xs tracking-widest uppercase">Rolar</span>
          <div className="w-px h-10 bg-white animate-pulse" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MANIFESTO / SOBRE
      ══════════════════════════════════════════════════ */}
      <section className="bg-zinc-950 py-20 px-6">
        <div
          ref={sobreRef}
          className={`max-w-4xl mx-auto transition-all duration-700 ${sobreVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">Manifesto</p>
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl uppercase leading-none text-white mb-8">
            {lc.manifesto.title1}<br />{lc.manifesto.title2}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-gray-400 font-body text-base leading-relaxed">
            <p>{lc.manifesto.body1}</p>
            <p>{lc.manifesto.body2}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-px mt-10 border border-white/10">
            {[
              { n: `${artists.length}+`, label: 'Artistas' },
              { n: `${tattoos.length}+`, label: 'Artes realizadas' },
              { n: '8',                 label: 'Estilos' },
            ].map(({ n, label }) => (
              <div key={label} className="bg-zinc-950 p-8 text-center">
                <p className="font-display text-5xl md:text-6xl text-white leading-none mb-2">{n}</p>
                <p className="font-body text-xs tracking-widest uppercase text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          ESTILOS
      ══════════════════════════════════════════════════ */}
      <section className="bg-black py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            ref={estilosRef}
            className={`mb-12 transition-all duration-700 ${estilosVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">Especialidades</p>
            <h2 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white">
              Seu estilo,<br />nossa arte
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-white/10">
            {TATTOO_STYLES.map((style, i) => {
              const info = lc.estilos?.[style] ?? { icon: '◎', desc: '' };
              return (
                <div
                  key={style}
                  className={`bg-zinc-950 p-6 group hover:bg-zinc-900 transition-all duration-700 border border-transparent hover:border-white/10 ${estilosVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <span className="font-display text-3xl text-ink-500 block mb-3">{info.icon}</span>
                  <h3 className="font-display text-xl uppercase tracking-wide text-white mb-2 leading-tight">{style}</h3>
                  <p className="font-body text-xs text-gray-600 group-hover:text-gray-400 transition-colors leading-relaxed">{info.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          ARTISTAS
      ══════════════════════════════════════════════════ */}
      <section className="bg-zinc-950 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            ref={teamRef}
            className={`mb-12 transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">A equipe</p>
            <h2 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white">
              Conheça os<br />artistas
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px border border-white/10">
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${artist.id}/400/600`; }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display text-lg uppercase tracking-wide text-white leading-tight">{artist.name}</p>
                  {artist.specialties.length > 0 && (
                    <p className="font-body text-xs tracking-widest uppercase text-gray-400 mt-1">
                      {artist.specialties.slice(0, 2).join(' · ')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/artistas"
              className="inline-block px-10 py-3 border border-white/20 hover:border-white text-gray-500 hover:text-white font-body font-bold text-xs tracking-widest uppercase transition-colors"
            >
              Ver todos os artistas →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PORTFÓLIO PREVIEW
      ══════════════════════════════════════════════════ */}
      <section className="bg-black py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            ref={galeriaRef}
            className={`mb-12 flex items-end justify-between transition-all duration-700 ${galeriaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <div>
              <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">Portfólio</p>
              <h2 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white">
                Artes<br />recentes
              </h2>
            </div>
            <Link
              to="/"
              className="hidden sm:block font-body text-xs font-bold tracking-widest uppercase text-gray-600 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5"
            >
              Ver vitrine completa →
            </Link>
          </div>

          {available.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-px border border-white/10">
              {available.map((tattoo, i) => (
                  <Link
                    key={tattoo.id}
                    to="/"
                    className={`group relative overflow-hidden aspect-[3/4] bg-zinc-900 block transition-all duration-700 ${galeriaVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    <img
                      src={tattoo.imageUrl}
                      alt={tattoo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tattoo.id}/400/600`; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="font-display text-base uppercase tracking-wide text-white">{tattoo.title}</p>
                      <p className="font-body text-xs tracking-widest uppercase text-gray-400">{tattoo.style}</p>
                      {tattoo.price && <p className="font-body text-sm text-white mt-1">{tattoo.price}</p>}
                    </div>
                  </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-white/10">
              <p className="font-display text-2xl uppercase tracking-widest text-gray-700">Portfólio em construção</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/" className="font-body text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-white transition-colors">
              Ver vitrine completa →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          COMO FUNCIONA
      ══════════════════════════════════════════════════ */}
      <section className="bg-zinc-950 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div
            ref={processoRef}
            className={`mb-12 transition-all duration-700 ${processoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">Processo</p>
            <h2 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white">
              Do sonho<br />à pele
            </h2>
          </div>

          <div className="space-y-px">
            {lc.processo.map(({ n, title, desc }, i) => (
              <div
                key={n}
                className={`flex gap-8 p-8 bg-black border-l-2 border-transparent hover:border-ink-500 hover:bg-zinc-950 transition-all duration-500 group ${processoVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <span className="font-display text-5xl text-white/10 group-hover:text-ink-500/30 transition-colors leading-none flex-shrink-0 w-14">{n}</span>
                <div>
                  <h3 className="font-display text-2xl uppercase tracking-wide text-white mb-2">{title}</h3>
                  <p className="font-body text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PREÇOS
      ══════════════════════════════════════════════════ */}
      <section className="bg-black py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div
            ref={precosRef}
            className={`mb-12 transition-all duration-700 ${precosVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">Investimento</p>
            <h2 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white">
              Quanto<br />custa?
            </h2>
            <p className="font-body text-sm text-gray-500 mt-6 leading-relaxed max-w-xl">
              O valor final depende do tamanho, complexidade e tempo de sessão. Abaixo uma referência geral — solicite um orçamento personalizado com o artista.
            </p>
          </div>

          <div className="grid gap-px border border-white/10">
            {lc.precos.map(({ label, range, detail }, i) => (
              <div
                key={label}
                className={`flex items-center justify-between px-6 py-5 bg-zinc-950 hover:bg-zinc-900 transition-all duration-700 group ${precosVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div>
                  <p className="font-body text-sm font-semibold text-white group-hover:text-white">{label}</p>
                  <p className="font-body text-xs tracking-widest uppercase text-gray-600 mt-0.5">{detail}</p>
                </div>
                <p className="font-display text-xl uppercase text-ink-500 flex-shrink-0 ml-6">{range}</p>
              </div>
            ))}
          </div>

          <p className="font-body text-xs text-gray-700 mt-4 tracking-wide">
            * Valores estimados. O orçamento final é definido pelo artista após análise do projeto.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════ */}
      <section className="bg-zinc-950 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div
            ref={faqRef}
            className={`mb-12 transition-all duration-700 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-4">Dúvidas</p>
            <h2 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white">
              Perguntas<br />frequentes
            </h2>
          </div>

          <div className="space-y-px">
            {lc.faq.map(({ q, a }, i) => (
              <div key={i} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className="font-body font-semibold text-sm text-white group-hover:text-gray-200 pr-8">{q}</span>
                  <span className={`font-display text-2xl text-ink-500 flex-shrink-0 transition-transform duration-300 ${faqOpen === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${faqOpen === i ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                  <p className="font-body text-sm text-gray-500 leading-relaxed">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA FINAL / CONTATO
      ══════════════════════════════════════════════════ */}
      <section id="contato" className="bg-black py-24 px-6 text-center relative overflow-hidden">
        {/* Decorative background text */}
        <p className="absolute inset-0 flex items-center justify-center font-display text-[20vw] text-white/[0.02] uppercase leading-none select-none pointer-events-none">
          El Dude
        </p>

        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="font-body text-xs font-bold tracking-widest uppercase text-ink2-500 mb-6">{lc.cta.tagline}</p>
          <h2 className="font-display text-5xl sm:text-8xl md:text-9xl uppercase leading-none text-white mb-8">
            {lc.cta.title1}<br />{lc.cta.title2}
          </h2>
          <p className="font-body text-base text-gray-500 mb-12 leading-relaxed">
            {lc.cta.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/artistas"
              className="px-12 py-4 bg-white hover:bg-gray-100 text-black font-body font-bold text-sm tracking-widest uppercase transition-colors"
            >
              Escolher artista
            </Link>
            <Link
              to="/"
              className="px-12 py-4 border border-white/25 hover:border-white text-white/60 hover:text-white font-body font-bold text-sm tracking-widest uppercase transition-colors"
            >
              Ver portfólio
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

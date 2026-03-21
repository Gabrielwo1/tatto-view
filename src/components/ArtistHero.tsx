import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

// Smooth multi-stop gradients — avoids banding artifacts
const GRADIENT_DARK =
  'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.82) 18%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.28) 58%, rgba(0,0,0,0.08) 78%, rgba(0,0,0,0) 100%)';

const GRADIENT_ACTIVE =
  'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 22%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.08) 68%, rgba(0,0,0,0) 100%)';

// Top vignette — prevents harsh pixel edge where hero meets navbar
const GRADIENT_TOP =
  'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 18%, rgba(0,0,0,0) 40%)';

export default function ArtistHero() {
  const artists = useStore((s) => s.artists);
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (artists.length === 0) return null;

  const navbarHeight = scrolled ? 64 : 192;

  return (
    <div
      className="flex w-full overflow-hidden transition-all duration-500 ease-in-out"
      style={{
        flexDirection: isMobile ? 'column' : 'row',
        height: isMobile ? 'auto' : `calc(100vh - ${navbarHeight}px)`,
      }}
    >
      {artists.map((artist, idx) => {
        const isHovered = hoveredId === artist.id;
        const anyHovered = hoveredId !== null;
        const active = isMobile || isHovered;

        return (
          <div
            key={artist.id}
            className="relative overflow-hidden cursor-pointer"
            style={
              isMobile
                ? { height: '240px', width: '100%' }
                : {
                    flex: anyHovered ? (isHovered ? 3 : 0.55) : 1,
                    transition: 'flex 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    // Promote each panel to its own GPU compositing layer
                    willChange: 'flex',
                    transform: 'translateZ(0)',
                  }
            }
            onMouseEnter={() => !isMobile && setHoveredId(artist.id)}
            onMouseLeave={() => !isMobile && setHoveredId(null)}
            onClick={() => navigate(`/artistas/${artist.id}`)}
          >
            {/* Background image — GPU-composited */}
            <img
              src={artist.photoUrl}
              alt={artist.name}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: isHovered ? 'scale(1.06) translateZ(0)' : 'scale(1) translateZ(0)',
                transition: 'transform 0.75s ease',
                willChange: 'transform',
                objectPosition: isMobile ? 'center 20%' : 'center',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${artist.id}/800/1200`;
              }}
            />

            {/* ── Gradient overlays — opacity-only transitions (GPU) ── */}

            {/* Layer 1: always-on dark gradient (resting state) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: GRADIENT_DARK,
                opacity: active ? 0 : 1,
                transition: 'opacity 0.55s ease',
              }}
            />

            {/* Layer 2: lighter gradient (active/hovered state) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: GRADIENT_ACTIVE,
                opacity: active ? 1 : 0,
                transition: 'opacity 0.55s ease',
              }}
            />

            {/* Layer 3: top vignette — always on, removes pixelated top edge */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: GRADIENT_TOP }}
            />

            {/* Separator */}
            {idx < artists.length - 1 && (
              <div
                className="absolute z-10 bg-white/10"
                style={
                  isMobile
                    ? { left: 0, right: 0, bottom: 0, height: '1px' }
                    : { top: 0, right: 0, bottom: 0, width: '1px' }
                }
              />
            )}

            {/* Artist number — desktop only */}
            {!isMobile && (
              <div
                className="absolute top-8 left-8 font-display text-2xl tracking-widest select-none"
                style={{
                  color: isHovered ? '#ffffff' : 'rgba(255,255,255,0.25)',
                  transition: 'color 0.35s ease',
                }}
              >
                0{idx + 1}
              </div>
            )}

            {/* Bottom content */}
            <div
              className="absolute left-6 right-6"
              style={{ bottom: isMobile ? '20px' : '40px' }}
            >
              {/* Specialties */}
              <div
                className="flex flex-wrap gap-2 mb-3"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s',
                }}
              >
                {artist.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-body font-semibold tracking-widest uppercase px-2 py-1 border select-none"
                    style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Artist name */}
              <h2
                className="font-display uppercase leading-none select-none whitespace-nowrap overflow-hidden text-ellipsis"
                style={{
                  fontSize: isMobile
                    ? '2.2rem'
                    : isHovered
                    ? 'clamp(2.5rem, 4vw, 4.5rem)'
                    : 'clamp(1rem, 2vw, 2rem)',
                  color: '#ffffff',
                  opacity: !isMobile && anyHovered && !isHovered ? 0.35 : 1,
                  transition: 'font-size 0.5s ease, opacity 0.35s ease',
                  letterSpacing: '0.02em',
                }}
              >
                {artist.name}
              </h2>

              {/* CTA */}
              <div
                className="flex items-center gap-3 mt-3"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? 'translateX(0)' : 'translateX(-12px)',
                  transition: 'opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s',
                }}
              >
                <span className="font-body font-semibold text-xs tracking-widest uppercase text-white select-none">
                  Ver trabalhos
                </span>
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

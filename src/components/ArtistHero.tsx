import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export default function ArtistHero() {
  const artists = useStore((s) => s.artists);
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (artists.length === 0) return null;

  return (
    <div className="flex w-full overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      {artists.map((artist, idx) => {
        const isHovered = hoveredId === artist.id;
        const anyHovered = hoveredId !== null;

        return (
          <div
            key={artist.id}
            className="relative overflow-hidden cursor-pointer"
            style={{
              flex: anyHovered ? (isHovered ? 3 : 0.55) : 1,
              transition: 'flex 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
            onMouseEnter={() => setHoveredId(artist.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => navigate(`/artistas/${artist.id}`)}
          >
            {/* Background image */}
            <img
              src={artist.photoUrl}
              alt={artist.name}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.75s ease',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${artist.id}/800/1200`;
              }}
            />

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: isHovered
                  ? 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.0) 100%)'
                  : 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.35) 100%)',
                transition: 'background 0.5s ease',
              }}
            />

            {/* Horizontal separator */}
            {idx < artists.length - 1 && (
              <div className="absolute top-0 right-0 bottom-0 w-px bg-white/10 z-10" />
            )}

            {/* Artist number */}
            <div
              className="absolute top-8 left-8 font-display text-2xl tracking-widest select-none"
              style={{
                color: isHovered ? '#ff4500' : 'rgba(255,255,255,0.25)',
                transition: 'color 0.35s ease',
              }}
            >
              0{idx + 1}
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-10 left-8 right-8">
              {/* Specialties */}
              <div
                className="flex flex-wrap gap-2 mb-4"
                style={{
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s',
                }}
              >
                {artist.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-body font-semibold tracking-widest uppercase px-2 py-1 border select-none"
                    style={{ color: '#ff4500', borderColor: 'rgba(255,69,0,0.4)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Artist name */}
              <h2
                className="font-display uppercase leading-none select-none whitespace-nowrap overflow-hidden text-ellipsis"
                style={{
                  fontSize: isHovered ? 'clamp(2.5rem, 4vw, 4.5rem)' : 'clamp(1rem, 2vw, 2rem)',
                  color: isHovered ? '#ff4500' : 'white',
                  opacity: anyHovered && !isHovered ? 0.35 : 1,
                  transition: 'font-size 0.5s ease, color 0.35s ease, opacity 0.35s ease',
                  letterSpacing: '0.02em',
                }}
              >
                {artist.name}
              </h2>

              {/* CTA */}
              <div
                className="flex items-center gap-3 mt-4"
                style={{
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'translateX(0)' : 'translateX(-12px)',
                  transition: 'opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s',
                }}
              >
                <span className="font-body font-semibold text-sm tracking-widest uppercase text-white select-none">
                  Ver trabalhos
                </span>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#ff4500" viewBox="0 0 24 24">
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

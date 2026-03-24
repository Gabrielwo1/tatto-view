import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import TattooCard from '../components/TattooCard';
import ArtistHero from '../components/ArtistHero';
import { TATTOO_STYLES, type Tattoo } from '../types';
import type { Artist } from '../types';

// Intercala artes de artistas diferentes para que nunca dois do mesmo
// artista apareçam em sequência.
function interleaveByArtist(tattoos: Tattoo[]): Tattoo[] {
  const groupMap = new Map<string, Tattoo[]>();
  for (const t of tattoos) {
    const key = t.artistId ?? '__studio__';
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(t);
  }

  const groups = Array.from(groupMap.values());
  const result: Tattoo[] = [];
  let lastKey: string | null = null;

  while (groups.some((g) => g.length > 0)) {
    groups.sort((a, b) => b.length - a.length);
    const nonLast = groups.find((g) => g.length > 0 && (g[0].artistId ?? '__studio__') !== lastKey);
    const picked = nonLast ?? groups.find((g) => g.length > 0)!;
    const item = picked.shift()!;
    result.push(item);
    lastKey = item.artistId ?? '__studio__';
  }

  return result;
}

/* ── Lightbox ──────────────────────────────────────────────────────────────── */
interface LightboxEntry { tattoo: Tattoo; artist?: Artist | null }

function Lightbox({ entry, onClose }: { entry: LightboxEntry; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  // Trigger enter animation after mount
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const { tattoo, artist } = entry;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundColor: visible ? 'rgba(0,0,0,0.93)' : 'rgba(0,0,0,0)',
        transition: 'background-color 0.3s ease',
      }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 text-white/40 hover:text-white transition-colors"
        aria-label="Fechar"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Content panel */}
      <div
        className="relative flex flex-col max-w-lg w-full max-h-[95vh]"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.93) translateY(16px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="overflow-hidden bg-zinc-950 flex-shrink min-h-0">
          <img
            src={tattoo.imageUrl}
            alt={tattoo.title}
            className="w-full max-h-[72vh] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tattoo.id}/600/800`;
            }}
          />
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between gap-4 pt-4 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="font-display text-lg md:text-xl uppercase tracking-wide text-white leading-none truncate">
              {tattoo.title}
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
              {artist && (
                <p className="font-body text-xs text-white/40 truncate">{artist.name}</p>
              )}
              {tattoo.price && (
                <>
                  {artist && <span className="text-white/20 text-xs">·</span>}
                  <p className="font-body text-xs" style={{ color: 'rgb(var(--ink-500))' }}>
                    {tattoo.price}
                  </p>
                </>
              )}
            </div>
          </div>

          {artist && (
            <Link
              to={`/artistas/${artist.id}`}
              onClick={onClose}
              className="shrink-0 font-body text-[10px] font-semibold tracking-widest uppercase px-4 py-2.5 border border-white/20 text-white hover:bg-white hover:text-black transition-colors"
            >
              Ver artista
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function ShowcasePage() {
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
  const [selectedStyle, setSelectedStyle] = useState<string>('Todos');
  const [lightbox, setLightbox] = useState<LightboxEntry | null>(null);
  const [lightboxMounted, setLightboxMounted] = useState(false);

  const available = tattoos.filter((t) => t.status === 'available');

  const filtered = useMemo(() => {
    const pool =
      selectedStyle === 'Todos'
        ? available
        : available.filter((t) => t.style === selectedStyle);
    return interleaveByArtist(pool);
  }, [available, selectedStyle]);

  const openLightbox = useCallback((tattoo: Tattoo, artist?: Artist | null) => {
    setLightbox({ tattoo, artist });
    setLightboxMounted(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxMounted(false);
    setTimeout(() => setLightbox(null), 320);
  }, []);

  return (
    <div>
      {/* Full-bleed artist hero */}
      <ArtistHero />

      {/* Tattoo showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
            Disponíveis
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-white uppercase tracking-wide leading-none">
            Vitrine
          </h2>
        </div>

        {/* Style filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {['Todos', ...TATTOO_STYLES].map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-4 py-1.5 text-xs font-body font-semibold tracking-widest uppercase transition-all border ${
                selectedStyle === style
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-gray-500 border-gray-700 hover:border-white hover:text-white'
              }`}
            >
              {style}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="font-display text-3xl tracking-widest uppercase">Nenhuma tatuagem encontrada</p>
          </div>
        ) : (
          /* ── Masonry columns grid ── */
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-x-3">
            {filtered.map((tattoo) => {
              const artist = artists.find((a) => a.id === tattoo.artistId);
              return (
                <div key={tattoo.id} className="break-inside-avoid mb-3">
                  <TattooCard
                    tattoo={tattoo}
                    artist={artist}
                    onClick={() => openLightbox(tattoo, artist)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox — rendered outside grid flow */}
      {lightbox && lightboxMounted && (
        <Lightbox entry={lightbox} onClose={closeLightbox} />
      )}
    </div>
  );
}

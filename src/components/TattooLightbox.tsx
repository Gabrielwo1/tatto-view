import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Tattoo, Artist } from '../types';


export interface LightboxEntry { tattoo: Tattoo; artist?: Artist | null }

export function TattooLightbox({ entry, onClose, hideArtistLink }: { entry: LightboxEntry; onClose: () => void; hideArtistLink?: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const { tattoo, artist } = entry;

  return (
    <>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8"
        style={{
          backgroundColor: visible ? 'rgba(0,0,0,0.93)' : 'rgba(0,0,0,0)',
          transition: 'background-color 0.3s ease',
        }}
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 text-white/40 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div
          className="relative flex flex-col max-w-lg w-full max-h-[95vh]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1) translateY(0)' : 'scale(0.93) translateY(16px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
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

            <div className="flex items-center gap-2 flex-shrink-0">
              {artist && !hideArtistLink && (
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
      </div>

    </>
  );
}

/** Hook that manages lightbox open/close state with exit animation */
export function useLightbox() {
  const [entry, setEntry] = useState<LightboxEntry | null>(null);
  const [mounted, setMounted] = useState(false);

  const open = useCallback((tattoo: Tattoo, artist?: Artist | null) => {
    setEntry({ tattoo, artist });
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setMounted(false);
    setTimeout(() => setEntry(null), 320);
  }, []);

  return { entry, mounted, open, close };
}

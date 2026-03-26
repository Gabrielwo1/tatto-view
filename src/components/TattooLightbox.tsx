import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Tattoo, Artist } from '../types';
import { useStore } from '../store';
import TattooBodyPreview from './TattooBodyPreview';

export interface LightboxEntry { tattoo: Tattoo; artist?: Artist | null }

export function TattooLightbox({ entry, onClose, hideArtistLink }: { entry: LightboxEntry; onClose: () => void; hideArtistLink?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [showBodyPreview, setShowBodyPreview] = useState(false);
  const isLoggedIn = useStore((s) => s.isAdmin || s.isArtist || s.isMerchManager);

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
              {/* Testar no Corpo — only for logged-in users */}
              {isLoggedIn && (
                <button
                  onClick={() => setShowBodyPreview(true)}
                  className="group relative font-body text-[10px] font-semibold tracking-widest uppercase px-4 py-2.5 overflow-hidden transition-all duration-300"
                  style={{ 
                    background: 'linear-gradient(45deg, rgba(var(--ink-500-rgb), 0.1), rgba(var(--ink-500-rgb), 0.2))',
                    border: '1px solid rgba(var(--ink-500-rgb), 0.5)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                  <span className="relative flex items-center gap-2 text-ink-500 group-hover:text-white transition-colors">
                    <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Testar no Corpo
                  </span>
                </button>
              )}

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

      {/* Body Preview Modal */}
      {showBodyPreview && (
        <TattooBodyPreview
          tattooImageUrl={tattoo.imageUrl}
          tattooTitle={tattoo.title}
          onClose={() => setShowBodyPreview(false)}
        />
      )}
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

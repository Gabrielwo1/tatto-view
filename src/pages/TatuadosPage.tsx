import { useState } from 'react';
import { useStore } from '../store';
import type { TatuadoPost } from '../types';

const PAGE_SIZE = 12;

// Maps size → grid span classes
const sizeClasses: Record<TatuadoPost['size'], string> = {
  small:  'col-span-1 row-span-1',
  medium: 'col-span-1 row-span-2',
  large:  'col-span-2 row-span-2',
};

export default function TatuadosPage() {
  const { title, subtitle } = useStore((s) => s.tatuadosContent);
  const posts   = useStore((s) => s.tatuadoPosts);
  const artists = useStore((s) => s.artists);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [lightbox, setLightbox] = useState<TatuadoPost | null>(null);

  const shown = posts.slice(0, visible);
  const hasMore = visible < posts.length;

  function getArtistName(artistId: string | null) {
    return artists.find((a) => a.id === artistId)?.name ?? null;
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Hero */}
      <div className="px-6 md:px-12 pt-16 pb-10 border-b border-white/5">
        <div className="w-1 h-10 bg-ink-500 mb-8" />
        <h1 className="font-display text-[clamp(3rem,12vw,9rem)] uppercase leading-none tracking-tight text-white mb-6">
          {title}
        </h1>
        <p className="font-body text-sm text-white/40 max-w-md leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Mosaic grid */}
      <div className="px-6 md:px-12 py-12">
        {posts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-body text-xs tracking-widest uppercase text-white/20">
              Nenhuma publicação ainda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[220px] gap-1">
            {shown.map((post) => (
              <button
                key={post.id}
                onClick={() => setLightbox(post)}
                className={`relative group overflow-hidden bg-zinc-900 focus:outline-none ${sizeClasses[post.size]}`}
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption || 'Tatuado'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-end p-4 opacity-0 group-hover:opacity-100">
                  <div className="text-left">
                    {post.caption && (
                      <p className="font-body text-xs text-white leading-snug line-clamp-2">
                        {post.caption}
                      </p>
                    )}
                    {getArtistName(post.artistId) && (
                      <p className="font-display text-[10px] uppercase tracking-widest text-ink-500 mt-1">
                        {getArtistName(post.artistId)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Expand */}
        {hasMore && (
          <div className="flex flex-col items-center mt-20">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="font-body text-xs font-semibold tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors"
            >
              Expand Archive
            </button>
            <div className="w-px h-16 bg-white/10 mt-4" />
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 z-10 p-2 text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={lightbox.imageUrl}
              alt={lightbox.caption}
              className="w-full max-h-[75vh] object-contain"
            />
            {(lightbox.caption || getArtistName(lightbox.artistId)) && (
              <div className="bg-zinc-950 border-t border-white/10 px-5 py-4">
                {lightbox.caption && (
                  <p className="font-body text-sm text-white/70 leading-relaxed">{lightbox.caption}</p>
                )}
                {getArtistName(lightbox.artistId) && (
                  <p className="font-display text-xs uppercase tracking-widest text-ink-500 mt-1">
                    {getArtistName(lightbox.artistId)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

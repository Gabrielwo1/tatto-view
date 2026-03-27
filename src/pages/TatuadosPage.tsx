import { useState } from 'react';
import { useStore } from '../store';
import { TattooLightbox } from '../components/TattooLightbox';
import type { Tattoo } from '../types';

const PAGE_SIZE = 9;

export default function TatuadosPage() {
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Tattoo | null>(null);

  const all = tattoos.filter((t) => t.status === 'available');
  const shown = all.slice(0, visible);
  const hasMore = visible < all.length;

  function getArtist(artistId: string | null) {
    return artists.find((a) => a.id === artistId) ?? null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="px-6 md:px-12 pt-16 pb-10 border-b border-white/5">
        <div className="w-1 h-10 bg-ink-500 mb-8" />
        <h1 className="font-display text-[clamp(3rem,12vw,9rem)] uppercase leading-none tracking-tight text-white mb-6">
          The Archive
        </h1>
        <p className="font-body text-sm text-white/40 max-w-md leading-relaxed">
          A curated selection of permanence. Our portfolio represents the
          intersection of anatomical precision and avant-garde artistry.
        </p>
      </div>

      {/* Grid */}
      <div className="px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {shown.map((tattoo) => (
            <button
              key={tattoo.id}
              onClick={() => setSelected(tattoo)}
              className="relative group aspect-square overflow-hidden bg-zinc-900 focus:outline-none"
            >
              <img
                src={tattoo.imageUrl}
                alt={tattoo.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end p-4 opacity-0 group-hover:opacity-100">
                <div>
                  <p className="font-display text-sm uppercase tracking-widest text-white leading-tight">
                    {tattoo.title}
                  </p>
                  {tattoo.style && (
                    <p className="font-body text-[10px] tracking-widest uppercase text-white/50 mt-1">
                      {tattoo.style}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Expand / Load more */}
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
      {selected && (
        <TattooLightbox
          entry={{ tattoo: selected, artist: getArtist(selected.artistId) }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

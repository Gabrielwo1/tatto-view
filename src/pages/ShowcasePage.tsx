import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import TattooCard from '../components/TattooCard';
import ArtistHero from '../components/ArtistHero';
import { TattooLightbox } from '../components/TattooLightbox';
import { useLightbox } from '../hooks/useLightbox';
import { TATTOO_STYLES } from '../types';
import { interleaveByArtist } from '../utils';

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function ShowcasePage() {
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
<<<<<<< HEAD
  const isLoading = useStore((s) => s.isLoading);
=======
  const hiddenStyles = useStore((s) => s.hiddenStyles);
  const customStyles = useStore((s) => s.customStyles);
>>>>>>> 109f2ea17a906fcc97cb379883ca6831aef03aee
  const [selectedStyle, setSelectedStyle] = useState<string>('Todos');
  const { entry: lightbox, mounted: lightboxMounted, open: openLightbox, close: closeLightbox } = useLightbox();

  const available = tattoos.filter((t) => t.status === 'available' && !hiddenStyles.includes(t.style));

  // Show styles that are not hidden by admin (admin config is the source of truth)
  const activeStyles = useMemo(
    () => [...TATTOO_STYLES, ...customStyles].filter(s => !hiddenStyles.includes(s)),
    [hiddenStyles, customStyles]
  );

  const filtered = useMemo(() => {
    const pool =
      selectedStyle === 'Todos'
        ? available
        : available.filter((t) => t.style === selectedStyle);
    return interleaveByArtist(pool).slice(0, 64);
  }, [available, selectedStyle]);

  // If the currently selected style was hidden, reset to "Todos"
  useEffect(() => {
    if (selectedStyle !== 'Todos' && hiddenStyles.includes(selectedStyle)) {
      setTimeout(() => setSelectedStyle('Todos'), 0);
    }
  }, [hiddenStyles, selectedStyle]);

  return (
    <div>
      {/* Full-bleed artist hero */}
      <ArtistHero />

      {/* Tattoo showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <div className="mb-10">
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-ink2-500 mb-2">
            Disponíveis
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-white uppercase tracking-wide leading-none">
            Vitrine
          </h2>
        </div>

        {/* Style filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {['Todos', ...activeStyles].map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-4 py-1.5 text-xs font-body font-semibold tracking-widest uppercase transition-all border ${
                selectedStyle === style
                  ? 'bg-ink-500 text-black border-ink-500'
                  : 'bg-transparent text-gray-500 border-gray-700 hover:border-ink-500 hover:text-ink-400'
              }`}
            >
              {style}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-600">
            <p className="font-display text-2xl tracking-widest uppercase animate-pulse">Carregando...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="font-display text-3xl tracking-widest uppercase">Nenhuma tatuagem encontrada</p>
          </div>
        ) : (
<<<<<<< HEAD
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-6">
            {filtered.map((tattoo) => (
              <TattooCard
                key={tattoo.id}
                tattoo={tattoo}
                artist={artists.find((a) => a.id === tattoo.artistId)}
              />
            ))}
=======
          /* ── Grid 4:5 (Instagram 1080×1350) ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((tattoo) => {
              const artist = artists.find((a) => a.id === tattoo.artistId);
              return (
                <TattooCard
                  key={tattoo.id}
                  tattoo={tattoo}
                  artist={artist}
                  onClick={() => openLightbox(tattoo, artist)}
                />
              );
            })}
>>>>>>> 109f2ea17a906fcc97cb379883ca6831aef03aee
          </div>
        )}
      </div>

      {lightbox && lightboxMounted && (
        <TattooLightbox entry={lightbox} onClose={closeLightbox} />
      )}
    </div>
  );
}

import { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { useStore } from '../store';
import TattooCard from '../components/TattooCard';
import ArtistHero from '../components/ArtistHero';
import { TattooLightbox } from '../components/TattooLightbox';
import { useLightbox } from '../hooks/useLightbox';
import { TATTOO_STYLES } from '../types';
import { interleaveByArtist } from '../utils';

const ITEMS_PER_PAGE = 24; // Load 24 items initially, then load more on scroll

// Memoized filter button to prevent re-renders
const FilterButton = memo(({ 
  style, 
  isSelected, 
  onClick 
}: { 
  style: string; 
  isSelected: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 text-xs font-body font-semibold tracking-widest uppercase transition-all border ${
      isSelected
        ? 'bg-ink-500 text-black border-ink-500'
        : 'bg-transparent text-gray-500 border-gray-700 hover:border-ink-500 hover:text-ink-400'
    }`}
  >
    {style}
  </button>
));

FilterButton.displayName = 'FilterButton';

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function ShowcasePage() {
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
  const hiddenStyles = useStore((s) => s.hiddenStyles);
  const customStyles = useStore((s) => s.customStyles);
  const [selectedStyle, setSelectedStyle] = useState<string>('Todos');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { entry: lightbox, mounted: lightboxMounted, open: openLightbox, close: closeLightbox } = useLightbox();

  // Memoized available tattoos
  const available = useMemo(
    () => tattoos.filter((t) => t.status === 'available' && !hiddenStyles.includes(t.style)),
    [tattoos, hiddenStyles]
  );

  // Memoized active styles
  const activeStyles = useMemo(
    () => [...TATTOO_STYLES, ...customStyles].filter(s => !hiddenStyles.includes(s)),
    [hiddenStyles, customStyles]
  );

  // Memoized filtered and interleaved tattoos
  const filtered = useMemo(() => {
    const pool =
      selectedStyle === 'Todos'
        ? available
        : available.filter((t) => t.style === selectedStyle);
    return interleaveByArtist(pool);
  }, [available, selectedStyle]);

  // Paginated results for virtualization
  const paginatedTattoos = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedStyle]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 &&
        visibleCount < filtered.length
      ) {
        setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filtered.length));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, filtered.length]);

  // If the currently selected style was hidden, reset to "Todos"
  useEffect(() => {
    if (selectedStyle !== 'Todos' && hiddenStyles.includes(selectedStyle)) {
      // Use requestAnimationFrame to avoid synchronous setState warning
      requestAnimationFrame(() => setSelectedStyle('Todos'));
    }
  }, [hiddenStyles, selectedStyle]);

  // Memoized callbacks
  const handleStyleClick = useCallback((style: string) => {
    setSelectedStyle(style);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTattooClick = useCallback((tattoo: typeof tattoos[0], artist: typeof artists[0] | undefined) => {
    openLightbox(tattoo, artist);
  }, [openLightbox]);

  // Memoized artist lookup
  const artistMap = useMemo(() => {
    const map = new Map(artists.map(a => [a.id, a]));
    return map;
  }, [artists]);

  const hasMore = visibleCount < filtered.length;

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
            <FilterButton
              key={style}
              style={style}
              isSelected={selectedStyle === style}
              onClick={() => handleStyleClick(style)}
            />
          ))}
        </div>

        {paginatedTattoos.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="font-display text-3xl tracking-widest uppercase">Nenhuma tatuagem encontrada</p>
          </div>
        ) : (
          <>
            {/* ── Grid 4:5 (Instagram 1080×1350) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {paginatedTattoos.map((tattoo, index) => {
                const artist = artistMap.get(tattoo.artistId ?? '');
                return (
                  <TattooCard
                    key={tattoo.id}
                    tattoo={tattoo}
                    artist={artist}
                    onClick={() => handleTattooClick(tattoo, artist)}
                    index={index % 8} // Stagger animation resets every 8 items
                  />
                );
              })}
            </div>

            {/* Load more indicator */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center gap-3 text-white/40">
                  <div className="w-2 h-2 bg-ink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-ink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-ink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {lightbox && lightboxMounted && (
        <TattooLightbox entry={lightbox} onClose={closeLightbox} />
      )}
    </div>
  );
}

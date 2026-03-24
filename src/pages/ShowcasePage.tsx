import { useState, useMemo } from 'react';
import { useStore } from '../store';
import TattooCard from '../components/TattooCard';
import ArtistHero from '../components/ArtistHero';
import { TattooLightbox, useLightbox } from '../components/TattooLightbox';
import { TATTOO_STYLES } from '../types';

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

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function ShowcasePage() {
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
  const hiddenStyles = useStore((s) => s.hiddenStyles);
  const [selectedStyle, setSelectedStyle] = useState<string>('Todos');
  const { entry: lightbox, mounted: lightboxMounted, open: openLightbox, close: closeLightbox } = useLightbox();

  const available = tattoos.filter((t) => t.status === 'available' && !hiddenStyles.includes(t.style));

  // Show styles that are not hidden by admin (admin config is the source of truth)
  const activeStyles = useMemo(
    () => TATTOO_STYLES.filter(s => !hiddenStyles.includes(s)),
    [hiddenStyles]
  );

  const filtered = useMemo(() => {
    const pool =
      selectedStyle === 'Todos'
        ? available
        : available.filter((t) => t.style === selectedStyle);
    return interleaveByArtist(pool);
  }, [available, selectedStyle]);

  // If the currently selected style was hidden, reset to "Todos"
  useMemo(() => {
    if (selectedStyle !== 'Todos' && hiddenStyles.includes(selectedStyle)) {
      setSelectedStyle('Todos');
    }
  }, [hiddenStyles, selectedStyle]);

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
          {['Todos', ...activeStyles].map((style) => (
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
          </div>
        )}
      </div>

      {lightbox && lightboxMounted && (
        <TattooLightbox entry={lightbox} onClose={closeLightbox} />
      )}
    </div>
  );
}

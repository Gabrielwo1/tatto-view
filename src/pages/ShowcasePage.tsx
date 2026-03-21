import { useState, useMemo } from 'react';
import { useStore } from '../store';
import TattooCard from '../components/TattooCard';
import ArtistHero from '../components/ArtistHero';
import { TATTOO_STYLES, type Tattoo } from '../types';

// Intercala artes de artistas diferentes para que nunca dois do mesmo
// artista apareçam em sequência. Usa algoritmo guloso: sempre escolhe
// o grupo com mais itens restantes que não seja o último selecionado.
function interleaveByArtist(tattoos: Tattoo[]): Tattoo[] {
  // Agrupa por artistId (null vira a string '__studio__')
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
    // Ordena grupos por tamanho decrescente
    groups.sort((a, b) => b.length - a.length);

    // Pega o maior grupo que não seja o último artista
    const nonLast = groups.find((g) => g.length > 0 && (g[0].artistId ?? '__studio__') !== lastKey);
    const picked = nonLast ?? groups.find((g) => g.length > 0)!;

    const item = picked.shift()!;
    result.push(item);
    lastKey = item.artistId ?? '__studio__';
  }

  return result;
}

export default function ShowcasePage() {
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
  const [selectedStyle, setSelectedStyle] = useState<string>('Todos');

  const available = tattoos.filter((t) => t.status === 'available');

  const filtered = useMemo(() => {
    const pool =
      selectedStyle === 'Todos'
        ? available
        : available.filter((t) => t.style === selectedStyle);
    return interleaveByArtist(pool);
  }, [available, selectedStyle]);

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

        {/* Filters */}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-5">
            {filtered.map((tattoo) => (
              <TattooCard
                key={tattoo.id}
                tattoo={tattoo}
                artist={artists.find((a) => a.id === tattoo.artistId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

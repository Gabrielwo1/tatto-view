import { useState } from 'react';
import { useStore } from '../store';
import TattooCard from '../components/TattooCard';
import { TATTOO_STYLES } from '../types';

export default function ArchivedPage() {
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
  const [selectedStyle, setSelectedStyle] = useState<string>('Todos');

  const archived = tattoos.filter((t) => t.status === 'archived');
  const filtered =
    selectedStyle === 'Todos'
      ? archived
      : archived.filter((t) => t.style === selectedStyle);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tatuagens Arquivadas</h1>
        <p className="text-gray-400">
          Designs que já fizeram parte da nossa vitrine. Inspire-se ou solicite uma peça similar.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['Todos', ...TATTOO_STYLES].map((style) => (
          <button
            key={style}
            onClick={() => setSelectedStyle(style)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedStyle === style
                ? 'bg-amber-500 text-gray-900'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            {style}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">Nenhuma tatuagem arquivada encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
  );
}

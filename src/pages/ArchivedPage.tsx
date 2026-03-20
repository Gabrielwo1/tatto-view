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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">Galeria</p>
        <h1 className="font-display text-5xl md:text-6xl text-white uppercase tracking-wide leading-none">Arquivadas</h1>
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
          <p className="font-display text-3xl tracking-widest uppercase">Nenhuma encontrada</p>
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
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { TATTOO_STYLES } from '../../types';

export default function AdminTattoos() {
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
  const deleteTattoo = useStore((s) => s.deleteTattoo);
  const archiveTattoo = useStore((s) => s.archiveTattoo);
  const [filter, setFilter] = useState<'all' | 'available' | 'archived'>('all');
  const [styleFilter, setStyleFilter] = useState('Todos');

  function handleDelete(id: string, title: string) {
    if (confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) {
      deleteTattoo(id);
    }
  }

  const filtered = tattoos
    .filter((t) => filter === 'all' || t.status === filter)
    .filter((t) => styleFilter === 'Todos' || t.style === styleFilter);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Admin</p>
          <h1 className="font-display text-3xl md:text-5xl text-white uppercase tracking-wide leading-none">Tatuagens</h1>
        </div>
        <Link
          to="/admin/tatuagens/nova"
          className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase px-5 py-3 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nova Arte
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'available', 'archived'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 text-xs font-body font-semibold tracking-widest uppercase transition-all border ${
              filter === s
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-gray-500 border-gray-700 hover:border-white hover:text-white'
            }`}
          >
            {s === 'all' ? 'Todas' : s === 'available' ? 'Disponíveis' : 'Arquivadas'}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-6 md:mb-8">
        {['Todos', ...TATTOO_STYLES].map((s) => (
          <button
            key={s}
            onClick={() => setStyleFilter(s)}
            className={`px-3 py-1 text-[10px] font-body font-semibold tracking-widest uppercase transition-all border ${
              styleFilter === s
                ? 'bg-white/20 text-white border-white/40'
                : 'bg-transparent text-gray-600 border-gray-800 hover:border-gray-600 hover:text-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-white/10 py-20 text-center">
          <p className="font-display text-2xl text-gray-700 uppercase tracking-widest">Nenhuma encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 md:gap-2">
          {filtered.map((t) => {
            const artist = artists.find((a) => a.id === t.artistId);
            return (
              <div key={t.id} className="group relative aspect-square overflow-hidden bg-zinc-900">
                <img
                  src={t.imageUrl}
                  alt={t.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${t.id}/400/400`;
                  }}
                />
                {/* Status dot */}
                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                  t.status === 'available' ? 'bg-white' : 'bg-white/30'
                }`} />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
                  <div>
                    <p className="font-display text-xs text-white uppercase tracking-wide leading-tight line-clamp-2">{t.title}</p>
                    <p className="font-body text-[10px] text-gray-500 mt-0.5 truncate">{artist?.name ?? 'Estúdio'}</p>
                    {t.price && <p className="font-body text-[10px] text-gray-400">{t.price}</p>}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => archiveTattoo(t.id)}
                      title={t.status === 'available' ? 'Arquivar' : 'Disponibilizar'}
                      className="flex-1 py-1 border border-white/30 text-white/70 hover:text-white hover:border-white text-[10px] font-body tracking-widest uppercase transition-colors text-center"
                    >
                      {t.status === 'available' ? 'Arquivar' : 'Ativar'}
                    </button>
                    <Link
                      to={`/admin/tatuagens/${t.id}/editar`}
                      className="p-1.5 border border-white/20 text-white/60 hover:text-white hover:border-white transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(t.id, t.title)}
                      className="p-1.5 border border-white/10 text-white/30 hover:text-white hover:border-white/60 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

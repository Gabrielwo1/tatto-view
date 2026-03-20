import { Link } from 'react-router-dom';
import { useStore } from '../../store';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-white/10 p-5 bg-black/40">
      <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-2">{label}</p>
      <p className="font-display text-5xl text-white leading-none">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);

  const available = tattoos.filter((t) => t.status === 'available').length;
  const archived = tattoos.filter((t) => t.status === 'archived').length;

  const recent = [...tattoos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 9);

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 md:mb-10">
        <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Admin</p>
        <h1 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wide leading-none">Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-6 md:mb-10">
        <StatCard label="Total" value={tattoos.length} />
        <StatCard label="Disponíveis" value={available} />
        <StatCard label="Arquivadas" value={archived} />
        <StatCard label="Artistas" value={artists.length} />
      </div>

      {/* Quick actions */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-8 md:mb-12">
        <Link
          to="/admin/tatuagens/nova"
          className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase px-6 py-3 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nova Arte
        </Link>
        <Link
          to="/admin/artistas/novo"
          className="flex items-center gap-2 bg-transparent border border-white/20 hover:border-white text-white font-body font-bold text-xs tracking-widest uppercase px-6 py-3 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Novo Artista
        </Link>
      </div>

      {/* Recent tattoos grid */}
      <div className="mb-4 flex items-baseline justify-between">
        <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-500">Artes Recentes</p>
        <Link to="/admin/tatuagens" className="font-body text-xs tracking-widest uppercase text-gray-600 hover:text-white transition-colors">
          Ver todas →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="border border-white/10 py-16 text-center">
          <p className="font-display text-2xl text-gray-700 uppercase tracking-widest">Nenhuma arte cadastrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 md:gap-2">
          {recent.map((t) => {
            const artist = artists.find((a) => a.id === t.artistId);
            return (
              <Link
                key={t.id}
                to={`/admin/tatuagens/${t.id}/editar`}
                className="group relative block aspect-[3/4] overflow-hidden bg-zinc-900"
              >
                <img
                  src={t.imageUrl}
                  alt={t.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${t.id}/400/400`;
                  }}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                  <p className="font-display text-sm text-white uppercase tracking-wide leading-tight truncate">{t.title}</p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">{artist?.name ?? 'Estúdio'}</p>
                  <div className="flex items-center justify-between mt-2">
                    {t.price && <span className="text-white text-xs font-body">{t.price}</span>}
                    <span className={`text-[10px] font-body font-semibold tracking-widest uppercase px-1.5 py-0.5 ${
                      t.status === 'available' ? 'bg-white text-black' : 'bg-white/20 text-white/60'
                    }`}>
                      {t.status === 'available' ? 'Disponível' : 'Arquivada'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useStore } from '../../store';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`bg-gray-900 rounded-xl p-5 border ${color}`}>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-white text-3xl font-bold mt-1">{value}</p>
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
    .slice(0, 5);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total de Tatuagens" value={tattoos.length} color="border-gray-700" />
        <StatCard label="Disponíveis" value={available} color="border-green-700/50" />
        <StatCard label="Arquivadas" value={archived} color="border-gray-600/50" />
        <StatCard label="Artistas" value={artists.length} color="border-amber-700/50" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          to="/admin/tatuagens/nova"
          className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-5 py-4 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Tatuagem
        </Link>
        <Link
          to="/admin/artistas/novo"
          className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white font-bold px-5 py-4 rounded-xl border border-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Novo Artista
        </Link>
      </div>

      {/* Recent tattoos */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Tatuagens Recentes</h2>
          <Link to="/admin/tatuagens" className="text-amber-400 text-sm hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="space-y-3">
          {recent.map((t) => {
            const artist = artists.find((a) => a.id === t.artistId);
            return (
              <div key={t.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                <img
                  src={t.imageUrl}
                  alt={t.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{t.title}</p>
                  <p className="text-gray-500 text-sm">{artist?.name ?? 'Estúdio'} · {t.style}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    t.status === 'available'
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {t.status === 'available' ? 'Disponível' : 'Arquivada'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useStore } from '../../store';

export default function AdminTattoos() {
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
  const deleteTattoo = useStore((s) => s.deleteTattoo);
  const archiveTattoo = useStore((s) => s.archiveTattoo);

  function handleDelete(id: string, title: string) {
    if (confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) {
      deleteTattoo(id);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Tatuagens</h1>
        <Link
          to="/admin/tatuagens/nova"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Tatuagem
        </Link>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-3">Tatuagem</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3 hidden md:table-cell">Artista</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3 hidden lg:table-cell">Estilo</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Status</th>
              <th className="text-right text-gray-400 text-sm font-medium px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tattoos.map((t) => {
              const artist = artists.find((a) => a.id === t.artistId);
              return (
                <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.imageUrl}
                        alt={t.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="text-white font-medium text-sm">{t.title}</p>
                        {t.price && <p className="text-amber-400 text-xs">{t.price}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-400 text-sm hidden md:table-cell">
                    {artist?.name ?? <span className="text-gray-600 italic">Estúdio</span>}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="px-2 py-0.5 bg-gray-800 text-amber-400 text-xs rounded-full border border-gray-700">
                      {t.style}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.status === 'available'
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {t.status === 'available' ? 'Disponível' : 'Arquivada'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => archiveTattoo(t.id)}
                        title={t.status === 'available' ? 'Arquivar' : 'Disponibilizar'}
                        className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </button>
                      <Link
                        to={`/admin/tatuagens/${t.id}/editar`}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(t.id, t.title)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {tattoos.length === 0 && (
          <div className="text-center py-12 text-gray-500">Nenhuma tatuagem cadastrada.</div>
        )}
      </div>
    </div>
  );
}

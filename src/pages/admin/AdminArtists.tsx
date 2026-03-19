import { Link } from 'react-router-dom';
import { useStore } from '../../store';

export default function AdminArtists() {
  const artists = useStore((s) => s.artists);
  const tattoos = useStore((s) => s.tattoos);
  const deleteArtist = useStore((s) => s.deleteArtist);

  function handleDelete(id: string, name: string) {
    if (confirm(`Excluir artista "${name}"? Esta ação não pode ser desfeita.`)) {
      deleteArtist(id);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Artistas</h1>
        <Link
          to="/admin/artistas/novo"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Artista
        </Link>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-3">Artista</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3 hidden md:table-cell">Especialidades</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3 hidden lg:table-cell">Tatuagens</th>
              <th className="text-right text-gray-400 text-sm font-medium px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist) => {
              const artistTattoos = tattoos.filter((t) => t.artistId === artist.id);
              return (
                <tr key={artist.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={artist.photoUrl}
                        alt={artist.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="text-white font-medium text-sm">{artist.name}</p>
                        {artist.instagram && (
                          <p className="text-gray-500 text-xs">{artist.instagram}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {artist.specialties.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-gray-800 text-amber-400 text-xs rounded-full border border-gray-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-400 text-sm hidden lg:table-cell">
                    {artistTattoos.length} tatuagem{artistTattoos.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/artistas/${artist.id}`}
                        title="Ver tatuagens"
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link
                        to={`/admin/artistas/${artist.id}/editar`}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(artist.id, artist.name)}
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
        {artists.length === 0 && (
          <div className="text-center py-12 text-gray-500">Nenhum artista cadastrado.</div>
        )}
      </div>
    </div>
  );
}

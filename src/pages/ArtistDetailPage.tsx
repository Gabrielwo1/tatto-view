import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import TattooCard from '../components/TattooCard';

export default function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const artists = useStore((s) => s.artists);
  const tattoos = useStore((s) => s.tattoos);
  const [tab, setTab] = useState<'available' | 'archived'>('available');

  const artist = artists.find((a) => a.id === id);
  if (!artist) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-xl">Artista não encontrado.</p>
        <Link to="/artistas" className="text-amber-400 hover:underline mt-4 inline-block">
          ← Voltar para Artistas
        </Link>
      </div>
    );
  }

  const artistTattoos = tattoos.filter((t) => t.artistId === artist.id);
  const filtered = artistTattoos.filter((t) => t.status === tab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link to="/artistas" className="text-gray-400 hover:text-amber-400 text-sm mb-6 inline-flex items-center gap-1">
        ← Todos os Artistas
      </Link>

      {/* Hero */}
      <div className="flex flex-col sm:flex-row gap-6 mb-10 mt-4 bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <img
          src={artist.photoUrl}
          alt={artist.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-amber-500 flex-shrink-0"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">{artist.name}</h1>
          <p className="text-gray-400 mb-4">{artist.bio}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {artist.specialties.map((s) => (
              <span
                key={s}
                className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full border border-amber-500/30"
              >
                {s}
              </span>
            ))}
          </div>
          {artist.instagram && (
            <span className="text-gray-500 text-sm">{artist.instagram}</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-800">
        <button
          onClick={() => setTab('available')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === 'available'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Disponíveis ({artistTattoos.filter((t) => t.status === 'available').length})
        </button>
        <button
          onClick={() => setTab('archived')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            tab === 'archived'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Arquivadas ({artistTattoos.filter((t) => t.status === 'archived').length})
        </button>
      </div>

      {/* Tattoos Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">
            {tab === 'available'
              ? 'Nenhuma tatuagem disponível deste artista.'
              : 'Nenhuma tatuagem arquivada deste artista.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((tattoo) => (
            <TattooCard key={tattoo.id} tattoo={tattoo} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
}

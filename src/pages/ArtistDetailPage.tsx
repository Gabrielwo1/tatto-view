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
        <Link to="/artistas" className="text-white hover:underline mt-4 inline-block font-body">
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
      <Link to="/artistas" className="text-gray-500 hover:text-white text-xs font-body font-semibold tracking-widest uppercase mb-8 inline-flex items-center gap-2 transition-colors">
        ← Artistas
      </Link>

      {/* Hero */}
      <div className="flex flex-col sm:flex-row gap-6 mb-12 mt-4 border border-white/10 p-6">
        <img
          src={artist.photoUrl}
          alt={artist.name}
          className="w-28 h-28 object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <h1 className="font-display text-4xl text-white uppercase tracking-wide mb-2">{artist.name}</h1>
          <p className="text-gray-500 text-sm font-body mb-4">{artist.bio}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {artist.specialties.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 text-white/70 text-xs font-semibold tracking-widest uppercase border border-white/20"
              >
                {s}
              </span>
            ))}
          </div>
          {artist.instagram && (
            <span className="text-gray-600 text-xs font-body tracking-wide">{artist.instagram}</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-white/10">
        <button
          onClick={() => setTab('available')}
          className={`pb-3 text-xs font-body font-semibold tracking-widest uppercase transition-colors border-b-2 ${
            tab === 'available'
              ? 'border-white text-white'
              : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Disponíveis ({artistTattoos.filter((t) => t.status === 'available').length})
        </button>
        <button
          onClick={() => setTab('archived')}
          className={`pb-3 text-xs font-body font-semibold tracking-widest uppercase transition-colors border-b-2 ${
            tab === 'archived'
              ? 'border-white text-white'
              : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Arquivadas ({artistTattoos.filter((t) => t.status === 'archived').length})
        </button>
      </div>

      {/* Tattoos Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="font-display text-2xl tracking-widest uppercase">
            {tab === 'available'
              ? 'Nenhuma disponível'
              : 'Nenhuma arquivada'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-x-2 gap-y-6">
          {filtered.map((tattoo) => (
            <TattooCard key={tattoo.id} tattoo={tattoo} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
}

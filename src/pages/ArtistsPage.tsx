import { useStore } from '../store';
import ArtistCard from '../components/ArtistCard';

export default function ArtistsPage() {
  const artists = useStore((s) => s.artists);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Nossos Artistas Residentes</h1>
        <p className="text-gray-400">
          Conheça os talentos que fazem parte do nosso estúdio. Cada artista tem seu estilo único.
        </p>
      </div>

      {artists.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">Nenhum artista cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
}

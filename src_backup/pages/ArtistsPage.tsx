import { useStore } from '../store';
import ArtistCard from '../components/ArtistCard';

export default function ArtistsPage() {
  const artists = useStore((s) => s.artists);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">Equipe</p>
        <h1 className="font-display text-5xl md:text-6xl text-white uppercase tracking-wide leading-none">Artistas</h1>
      </div>

      {artists.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="font-display text-3xl tracking-widest uppercase">Nenhum artista cadastrado</p>
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

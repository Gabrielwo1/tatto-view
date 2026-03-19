import type { Tattoo, Artist } from '../types';

interface TattooCardProps {
  tattoo: Tattoo;
  artist?: Artist | null;
}

export default function TattooCard({ tattoo, artist }: TattooCardProps) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-amber-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-amber-500/10">
      {/* Image */}
      <div className="relative overflow-hidden aspect-video">
        <img
          src={tattoo.imageUrl}
          alt={tattoo.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tattoo.id}/600/400`;
          }}
        />
        {/* Status badge */}
        {tattoo.status === 'archived' && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-900/90 text-gray-400 text-xs rounded-full border border-gray-700">
            Arquivada
          </div>
        )}
        {/* Style badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500/90 text-gray-900 text-xs font-semibold rounded-full">
          {tattoo.style}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-1 truncate">{tattoo.title}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{tattoo.description}</p>

        <div className="flex items-center justify-between">
          {/* Artist */}
          <div className="flex items-center gap-1.5">
            {artist ? (
              <>
                <img
                  src={artist.photoUrl}
                  alt={artist.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-gray-400 text-sm">{artist.name}</span>
              </>
            ) : (
              <span className="text-gray-600 text-sm italic">Estúdio</span>
            )}
          </div>

          {/* Price */}
          {tattoo.price && (
            <span className="text-amber-400 font-semibold text-sm">{tattoo.price}</span>
          )}
        </div>
      </div>
    </div>
  );
}

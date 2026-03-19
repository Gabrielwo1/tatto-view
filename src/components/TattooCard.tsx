import type { Tattoo, Artist } from '../types';

interface TattooCardProps {
  tattoo: Tattoo;
  artist?: Artist | null;
}

export default function TattooCard({ tattoo, artist }: TattooCardProps) {
  return (
    <div className="bg-zinc-950 overflow-hidden border border-white/[0.08] hover:border-ink-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-ink-500/10">
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
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 text-white/40 text-xs tracking-widest uppercase font-semibold">
            Arquivada
          </div>
        )}
        {/* Style badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-ink-500 text-white text-xs font-semibold tracking-widest uppercase">
          {tattoo.style}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-xl text-white uppercase tracking-wide mb-1 truncate">{tattoo.title}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{tattoo.description}</p>

        <div className="flex items-center justify-between">
          {/* Artist */}
          <div className="flex items-center gap-1.5">
            {artist ? (
              <>
                <img
                  src={artist.photoUrl}
                  alt={artist.name}
                  className="w-5 h-5 object-cover"
                />
                <span className="text-gray-500 text-xs font-medium tracking-wide">{artist.name}</span>
              </>
            ) : (
              <span className="text-gray-600 text-xs italic">Estúdio</span>
            )}
          </div>

          {/* Price */}
          {tattoo.price && (
            <span className="text-ink-400 font-bold text-sm">{tattoo.price}</span>
          )}
        </div>
      </div>
    </div>
  );
}

import type { Tattoo, Artist } from '../types';

interface TattooCardProps {
  tattoo: Tattoo;
  artist?: Artist | null;
}

export default function TattooCard({ tattoo, artist: _artist }: TattooCardProps) {
  return (
    <div className="group cursor-pointer">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4] mb-3 bg-zinc-900">
        <img
          src={tattoo.imageUrl}
          alt={tattoo.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tattoo.id}/600/600`;
          }}
        />
        {tattoo.status === 'archived' && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 text-white/50 text-[10px] tracking-widest uppercase font-semibold">
            Arquivada
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-sm uppercase tracking-wide text-white leading-tight mb-1 truncate">
        {tattoo.title}
      </h3>

      {/* Price */}
      {tattoo.price && (
        <p className="text-gray-400 text-xs font-body">{tattoo.price}</p>
      )}
    </div>
  );
}

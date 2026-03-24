import { Link } from 'react-router-dom';
import type { Tattoo, Artist } from '../types';

// Deterministic aspect ratio — same tattoo always gets the same proportion
const ASPECTS = [
  'aspect-[3/4]',
  'aspect-[2/3]',
  'aspect-square',
  'aspect-[4/5]',
  'aspect-[3/5]',
  'aspect-[4/6]',
];
export function getAspect(id: string): string {
  const n = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return ASPECTS[n % ASPECTS.length];
}

interface TattooCardProps {
  tattoo: Tattoo;
  artist?: Artist | null;
  /** When provided the card renders as a button and calls this instead of navigating */
  onClick?: () => void;
}

export default function TattooCard({ tattoo, artist, onClick }: TattooCardProps) {
  const href = artist ? `/artistas/${artist.id}` : '/artistas';
  const aspect = getAspect(tattoo.id);

  const inner = (
    <>
      <div className={`relative overflow-hidden bg-zinc-900 ${aspect}`}>
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

      <div className="pt-2 pb-1">
        <h3 className="font-display text-sm uppercase tracking-wide text-white leading-tight mb-0.5 truncate">
          {tattoo.title}
        </h3>
        {artist && (
          <p className="font-body text-[10px] text-white/30 truncate">{artist.name}</p>
        )}
        {tattoo.price && (
          <p className="text-gray-500 text-[10px] font-body mt-0.5">{tattoo.price}</p>
        )}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="group cursor-pointer block w-full text-left">
        {inner}
      </button>
    );
  }

  return (
    <Link to={href} className="group cursor-pointer block">
      {inner}
    </Link>
  );
}

import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { Tattoo, Artist } from '../types';
import WishlistButton from './WishlistButton';

interface TattooCardProps {
  tattoo: Tattoo;
  artist?: Artist | null;
  /** When provided the card renders as a button and calls this instead of navigating */
  onClick?: () => void;
}

function TattooCard({ tattoo, artist, onClick }: TattooCardProps) {
  const href = artist ? `/artistas/${artist.id}` : '/artistas';

  const inner = (
    <>
      <div className="relative overflow-hidden bg-zinc-900 aspect-[4/5]">
        <img
          src={tattoo.imageUrl}
          alt={tattoo.title}
          loading="lazy"
          decoding="async"
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
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <WishlistButton itemType="tattoo" itemId={tattoo.id} className="bg-black/60 rounded-full" />
        </div>
      </div>

      <div className="pt-2 pb-1 h-[4.25rem] flex flex-col justify-start overflow-hidden">
        <h3 className="font-display text-base uppercase tracking-wide text-white leading-tight mb-0.5 truncate">
          {tattoo.title}
        </h3>
        {artist && (
          <p className="font-body text-xs text-white/30 truncate">{artist.name}</p>
        )}
        {tattoo.price && (
          <p className="text-xs font-body mt-0.5">
            <span className="text-ink2-500">a partir de </span>
            <span className="text-ink-500">{tattoo.price}</span>
          </p>
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

export default memo(TattooCard);

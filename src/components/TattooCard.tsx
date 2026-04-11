import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Tattoo, Artist } from '../types';
import WishlistButton from './WishlistButton';
import { toSlug } from '../utils';
import { formatPrice } from '../lib/utils';

interface TattooCardProps {
  tattoo: Tattoo;
  artist?: Artist | null;
  /** When provided the card renders as a button and calls this instead of navigating */
  onClick?: () => void;
  /** Index for staggered animation delay */
  index?: number;
}

function TattooCard({ tattoo, artist, onClick, index = 0 }: TattooCardProps) {
  const href = artist ? `/artistas/${toSlug(artist.name)}` : '/artistas';
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy rendering
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const inner = (
    <>
      <div className="relative overflow-hidden bg-zinc-800 aspect-[4/5]">
        {/* Skeleton placeholder */}
        <div 
          className={`absolute inset-0 bg-zinc-800 transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{
            background: 'linear-gradient(90deg, #27272a 25%, #3f3f46 50%, #27272a 75%)',
            backgroundSize: '200% 100%',
            animation: isVisible ? 'shimmer 1.5s infinite' : 'none'
          }}
        />
        
        {isVisible && (
          <img
            src={tattoo.imageUrl}
            alt={tattoo.title}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } group-hover:scale-105`}
            onLoad={handleImageLoad}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tattoo.id}/600/600`;
            }}
          />
        )}
        
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
            <span className="text-ink-500">{formatPrice(tattoo.price)}</span>
          </p>
        )}
      </div>
    </>
  );

  const animationDelay = Math.min(index * 50, 500); // Cap at 500ms

  if (onClick) {
    return (
      <div 
        ref={cardRef}
        className="group cursor-pointer block w-full text-left"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: `opacity 0.5s ease ${animationDelay}ms, transform 0.5s ease ${animationDelay}ms`
        }}
      >
        <button onClick={onClick} className="w-full text-left">
          {inner}
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className="group cursor-pointer block"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${animationDelay}ms, transform 0.5s ease ${animationDelay}ms`
      }}
    >
      <Link to={href} className="block">
        {inner}
      </Link>
    </div>
  );
}

export default memo(TattooCard, (prev, next) => {
  // Custom comparison for memo
  return (
    prev.tattoo.id === next.tattoo.id &&
    prev.tattoo.status === next.tattoo.status &&
    prev.artist?.id === next.artist?.id &&
    prev.index === next.index
  );
});

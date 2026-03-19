import { Link } from 'react-router-dom';
import type { Artist } from '../types';

interface ArtistCardProps {
  artist: Artist;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link
      to={`/artistas/${artist.id}`}
      className="block bg-zinc-950 overflow-hidden border border-white/[0.08] hover:border-white/30 transition-all duration-300 group hover:shadow-xl hover:shadow-white/5"
    >
      {/* Photo */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={artist.photoUrl}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${artist.id}/400/400`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-2xl text-white uppercase tracking-wide mb-2 group-hover:text-gray-300 transition-colors">
          {artist.name}
        </h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{artist.bio}</p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {artist.specialties.map((specialty) => (
            <span
              key={specialty}
              className="px-2 py-0.5 text-white/70 text-xs font-semibold tracking-widest uppercase border border-white/20"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Instagram */}
        {artist.instagram && (
          <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium tracking-wide">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>{artist.instagram}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

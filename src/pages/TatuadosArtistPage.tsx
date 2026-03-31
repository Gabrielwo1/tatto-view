import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { toSlug } from '../utils';
import type { TatuadoPost } from '../types';

export default function TatuadosArtistPage() {
  const { slug } = useParams<{ slug: string }>();
  const posts   = useStore((s) => s.tatuadoPosts);
  const artists = useStore((s) => s.artists);
  const [lightbox, setLightbox] = useState<TatuadoPost | null>(null);

  const artist = artists.find((a) => toSlug(a.name) === slug);

  if (!artist) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="font-body text-xs tracking-widest uppercase text-white/30">Artista não encontrado</p>
      </div>
    );
  }

  const artistPosts = posts.filter((p) => p.artistId === artist.id);

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <div className="px-6 md:px-12 pt-14 pb-8 border-b border-white/5">
        <Link
          to="/tatuados"
          className="font-body text-xs font-semibold tracking-widest uppercase text-white/30 hover:text-white transition-colors inline-flex items-center gap-2 mb-8"
        >
          ← Tatuados
        </Link>
        <div className="flex items-center gap-5 mt-4">
          <img
            src={artist.photoUrl}
            alt={artist.name}
            className="w-16 h-16 rounded-full object-cover border border-white/10"
          />
          <div>
            <h1 className="font-display text-4xl md:text-6xl uppercase tracking-wide text-white leading-none">
              {artist.name}
            </h1>
            <p className="font-body text-xs text-white/30 tracking-widest uppercase mt-1">
              {artistPosts.length} {artistPosts.length === 1 ? 'foto tatuada' : 'fotos tatuadas'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Instagram-style */}
      {artistPosts.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-body text-xs tracking-widest uppercase text-white/20">
            Nenhuma foto ainda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5">
          {artistPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => setLightbox(post)}
              className="relative group aspect-square overflow-hidden bg-zinc-900 focus:outline-none"
            >
              <img
                src={post.imageUrl}
                alt={post.caption || artist.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              {post.caption && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-300 flex items-end p-3 opacity-0 group-hover:opacity-100">
                  <p className="font-body text-xs text-white line-clamp-3 leading-snug text-left">
                    {post.caption}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 z-10 p-2 text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={lightbox.imageUrl}
              alt={lightbox.caption}
              className="w-full max-h-[75vh] object-contain"
            />
            <div className="bg-zinc-950 border-t border-white/10 px-5 py-4">
              {lightbox.caption && (
                <p className="font-body text-sm text-white/70 leading-relaxed">{lightbox.caption}</p>
              )}
              <p className="font-display text-xs uppercase tracking-widest text-ink-500 mt-1">
                {artist.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

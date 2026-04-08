import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { toSlug } from '../utils';
import GeneralLightbox from '../components/GeneralLightbox';

export default function ArtistGuestTripPage() {
  const { slug } = useParams<{ slug: string }>();
  const artists = useStore((s) => s.artists);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const artist = useMemo(() => artists.find((a) => toSlug(a.name) === slug), [artists, slug]);

  if (!artist || !artist.guestTrip || !artist.guestTrip.active) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-xl">Guest Trip não encontrada.</p>
        <Link to={`/artistas/${slug}`} className="text-white hover:underline mt-4 inline-block font-body">
          ← Voltar para Perfil do Artista
        </Link>
      </div>
    );
  }

  const { guestTrip } = artist;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {selectedImage && (
        <GeneralLightbox imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      {/* Header Navigation */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-6 flex items-center justify-between">
        <Link 
          to={`/artistas/${slug}`} 
          className="text-gray-500 hover:text-white text-xs font-body font-semibold tracking-widest uppercase transition-colors inline-flex items-center gap-2"
        >
          ← Voltar ao Perfil
        </Link>
        <span className="text-[10px] font-display uppercase tracking-[0.3em] text-ink-500">
          {guestTrip.tagline || 'GUEST TRIP'}
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Main Heading */}
        <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tighter leading-none mb-8">
          {guestTrip.title}
        </h1>

        {/* Banner Image - Full Width of container */}
        <div 
          className="aspect-video bg-zinc-900 border border-white/10 overflow-hidden cursor-zoom-in mb-8"
          onClick={() => setSelectedImage(guestTrip.bannerUrl)}
        >
          <img 
            src={guestTrip.bannerUrl} 
            alt={guestTrip.guestName} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
          />
        </div>

        {/* Info & Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
          {/* Info Side */}
          <div className="bg-zinc-950 p-8 flex flex-col justify-center">
            <p className="font-body text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-600 mb-4">
              {guestTrip.subtitle || 'ARTISTA CONVIDADO'}
            </p>
            <h2 className="font-display text-4xl lg:text-5xl uppercase tracking-wide mb-2">
              {guestTrip.guestName}
            </h2>
            <p className="font-body text-sm text-white/60 mb-6">
              {guestTrip.period}
            </p>
            {guestTrip.instagram && (
              <a 
                href={`https://instagram.com/${guestTrip.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-500 hover:text-white font-body text-sm tracking-wide transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                {guestTrip.instagram}
              </a>
            )}
          </div>

          {/* Gallery Side */}
          <div className="grid grid-cols-2 gap-px bg-white/10">
            {(guestTrip.galleryImages || []).map((img, i) => (
              <div 
                key={i} 
                className="aspect-square bg-zinc-950 overflow-hidden cursor-zoom-in"
                onClick={() => setSelectedImage(img)}
              >
                {img ? (
                  <img 
                    src={img} 
                    alt={`Gallery ${i + 1}`} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      console.error(`[GuestTrip] Failed to load image ${i}:`, img);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center border border-white/5">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-800">Preview</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

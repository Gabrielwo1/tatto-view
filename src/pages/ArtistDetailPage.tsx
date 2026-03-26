import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import TattooCard from '../components/TattooCard';
import { TattooLightbox, useLightbox } from '../components/TattooLightbox';
import html2canvas from 'html2canvas';

export default function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const artists = useStore((s) => s.artists);
  const tattoos = useStore((s) => s.tattoos);
  const isArtist = useStore((s) => s.isArtist);
  const [tab, setTab] = useState<'available' | 'archived'>('available');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printImage, setPrintImage] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { entry: lightbox, mounted: lightboxMounted, open: openLightbox, close: closeLightbox } = useLightbox();

  const artist = artists.find((a) => a.id === id);
  if (!artist) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-xl">Artista não encontrado.</p>
        <Link to="/artistas" className="text-white hover:underline mt-4 inline-block font-body">
          ← Voltar para Artistas
        </Link>
      </div>
    );
  }

  const artistTattoos = tattoos.filter((t) => t.artistId === artist.id);
  const filtered = artistTattoos.filter((t) => t.status === tab);

  const handlePrint = async () => {
    if (!printRef.current) return;
    try {
      setIsPrinting(true);
      const canvas = await html2canvas(printRef.current, {
        useCORS: true,
        backgroundColor: '#0a0a0a',
        scale: 2
      });
      const dataUrl = canvas.toDataURL('image/png', 0.9);
      setPrintImage(dataUrl);
    } catch (err) {
      console.error('Falha ao gerar o print', err);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPrint = () => {
    if (!printImage) return;
    const a = document.createElement('a');
    a.href = printImage;
    a.download = `portfolio-${artist.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="flex items-center justify-between mb-8">
        <Link to="/artistas" className="text-gray-500 hover:text-ink-400 text-xs font-body font-semibold tracking-widest uppercase inline-flex items-center gap-2 transition-colors">
          ← Artistas
        </Link>
        {isArtist && (
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-2 px-4 py-2 bg-ink-500 text-black hover:bg-ink-400 text-xs font-body font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
          >
            {isPrinting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Gerando...
              </span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Exportar Portfólio
              </>
            )}
          </button>
        )}
      </div>

      <div ref={printRef} className="bg-[#0a0a0a] pb-10 -m-4 p-4 sm:m-0 sm:p-0">
        {/* Hero */}
        <div className="flex flex-col sm:flex-row gap-6 mb-12 mt-4 border border-white/10 p-6">
        <img
          src={artist.photoUrl}
          alt={artist.name}
          className="w-56 h-56 object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <h1 className="font-display text-4xl text-white uppercase tracking-wide mb-2">{artist.name}</h1>
          <p className="text-gray-500 text-sm font-body mb-4">{artist.bio}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {artist.specialties.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 text-ink2-400 text-xs font-semibold tracking-widest uppercase border border-ink2-500/30"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {artist.instagram && (
              <a
                href={artist.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-pink-500 text-white/70 hover:text-pink-400 text-xs font-body font-semibold tracking-widest uppercase transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
            )}
            {artist.whatsapp && (
              <a
                href={artist.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-green-500 text-white/70 hover:text-green-400 text-xs font-body font-semibold tracking-widest uppercase transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-white/10">
        <button
          onClick={() => setTab('available')}
          className={`pb-3 text-xs font-body font-semibold tracking-widest uppercase transition-colors border-b-2 ${
            tab === 'available'
              ? 'border-ink-500 text-ink-400'
              : 'border-transparent text-gray-500 hover:text-ink2-400'
          }`}
        >
          Disponíveis ({artistTattoos.filter((t) => t.status === 'available').length})
        </button>
        <button
          onClick={() => setTab('archived')}
          className={`pb-3 text-xs font-body font-semibold tracking-widest uppercase transition-colors border-b-2 ${
            tab === 'archived'
              ? 'border-ink-500 text-ink-400'
              : 'border-transparent text-gray-500 hover:text-ink2-400'
          }`}
        >
          Arquivadas ({artistTattoos.filter((t) => t.status === 'archived').length})
        </button>
      </div>

      {/* Tattoos Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="font-display text-2xl tracking-widest uppercase">
            {tab === 'available'
              ? 'Nenhuma disponível'
              : 'Nenhuma arquivada'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-5">
          {filtered.map((tattoo) => (
            <TattooCard
              key={tattoo.id}
              tattoo={tattoo}
              artist={artist}
              onClick={() => openLightbox(tattoo, artist)}
            />
          ))}
        </div>
      )}

      </div>

      {printImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#111] max-w-4xl w-full max-h-[90vh] flex flex-col border border-white/10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]">
              <h3 className="font-display tracking-widest uppercase text-white">Visualização de Portfólio</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPrint}
                  className="px-4 py-2 bg-ink-500 hover:bg-ink-400 text-black text-xs font-body font-bold transition-colors uppercase tracking-wider flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </button>
                <button
                  onClick={() => setPrintImage(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <img src={printImage} alt="Print Portfólio" className="w-full shadow-2xl" />
            </div>
          </div>
        </div>
      )}

      {lightbox && lightboxMounted && (
        <TattooLightbox entry={lightbox} onClose={closeLightbox} hideArtistLink />
      )}
    </div>
  );
}

import { useEffect } from 'react';

interface Props {
  imageUrl: string;
  onClose: () => void;
}

export default function GeneralLightbox({ imageUrl, onClose }: Props) {
  // Prevent scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Absolute controls */}
      <div className="absolute top-6 right-6 z-10 flex gap-4">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
          aria-label="Fechar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div 
        className="relative max-w-5xl max-h-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt="Visualização" 
          className="w-full h-full object-contain shadow-2xl border border-white/10"
        />
        
        {/* Helper text */}
        <p className="mt-4 font-body text-[10px] tracking-[0.4em] uppercase text-white/30 text-center">
          Clique fora para fechar
        </p>
      </div>
    </div>
  );
}

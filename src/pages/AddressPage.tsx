import { useStore } from '../store';

export default function AddressPage() {
  const c = useStore((s) => s.sobreNosContent);
  const { studio } = c;

  const mapAddress = encodeURIComponent([studio.street, studio.city, studio.cep].filter(Boolean).join(', '));
  const mapSrc = `https://maps.google.com/maps?q=${mapAddress}&z=${studio.mapZoom || 15}&output=embed`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[70vh]">
      <div className="mb-12">
        <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">Onde estamos</p>
        <h1 className="font-display text-5xl md:text-7xl text-white uppercase tracking-wide leading-none">Endereço</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div>
          <h2 className="font-display text-3xl lg:text-4xl uppercase tracking-wide text-ink-500 mb-8">
            {studio.title}
          </h2>
          <div className="mb-8">
            <p className="font-display text-xl uppercase tracking-wide">{studio.street}</p>
            <p className="font-display text-xl uppercase tracking-wide">{studio.city}</p>
            <p className="font-display text-xl uppercase tracking-wide">{studio.cep}</p>
          </div>
          <div>
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-4">Horários</p>
            <div className="space-y-3">
              {studio.hours.map((h, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className={`font-body text-sm font-semibold tracking-widest uppercase ${h.closed ? 'text-ink-500' : 'text-white/70'}`}>
                    {h.days}
                  </span>
                  <span className={`font-body text-sm tracking-widest ${h.closed ? 'text-ink-500' : 'text-white/50'}`}>
                    {h.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${mapAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-10 py-4 bg-white hover:bg-gray-100 text-black font-body font-bold text-sm tracking-widest uppercase transition-colors"
            >
              Abrir no Google Maps
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="w-full aspect-square lg:aspect-[4/3] bg-zinc-800 border border-white/10 overflow-hidden">
            <iframe
              src={mapSrc}
              title="Localização"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(0.9)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {studio.mapLabel && (
            <p className="mt-2 font-body text-[10px] tracking-widest uppercase text-white/30 text-center">
              {studio.mapLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

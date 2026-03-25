import { useStore } from '../store';

export default function MerchsPage() {
  const merchs = useStore((s) => s.merchs);
  const sessions = useStore((s) => s.sessions);

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 pt-16 pb-12 border-b border-white/10">
        <p className="font-body text-[10px] font-semibold tracking-[0.3em] uppercase text-gray-600 mb-6">
          HIGH CONTRAST BRUTALISM FOR THE SOUL.
        </p>
        <h1 className="font-display text-6xl md:text-8xl uppercase leading-none tracking-tight text-white mb-0">
          INK<br />MANIFESTO.
        </h1>
      </section>

      {/* ── TATTOO SESSIONS ──────────────────────────────────────────────── */}
      {sessions.length > 0 && (
        <section className="px-6 lg:px-12 py-10 border-b border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-display text-xs font-bold tracking-[0.3em] uppercase text-white">
              TATTOO SESSIONS
            </h2>
            <span className="font-body text-[9px] font-bold tracking-[0.25em] uppercase text-green-400 border border-green-400/40 px-2 py-0.5">
              AVAILABLE NOW
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 lg:-mx-12 lg:px-12 scrollbar-none snap-x snap-mandatory">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex-shrink-0 snap-start w-72 bg-zinc-950 border border-white/10 p-6 flex flex-col"
              >
                <p className="font-body text-[9px] font-semibold tracking-[0.3em] uppercase text-gray-600 mb-4">
                  TYPE {session.typeNum}
                </p>
                <h3 className="font-display text-3xl uppercase leading-tight text-white mb-3">
                  {session.title}
                </h3>
                <p className="font-body text-xs text-gray-500 leading-relaxed mb-6 flex-1">
                  {session.description}
                </p>
                <div className="border-t border-white/10 pt-4">
                  <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">A partir de</p>
                  <p className="font-display text-4xl text-white leading-none mb-4">{session.price}</p>
                  {session.bookingLink ? (
                    <a
                      href={session.bookingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-white text-black font-body font-bold text-[10px] tracking-[0.25em] uppercase py-3 hover:bg-gray-100 transition-colors"
                    >
                      BOOK NOW
                    </a>
                  ) : (
                    <div className="w-full text-center border border-white/20 text-white/40 font-body font-bold text-[10px] tracking-[0.25em] uppercase py-3">
                      BOOK NOW
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── APPAREL ──────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 py-10 border-b border-white/10">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-display text-xs font-bold tracking-[0.3em] uppercase text-white">
            APPAREL
          </h2>
          <span className="font-body text-[9px] font-bold tracking-[0.25em] uppercase text-gray-600">
            STREETWEAR
          </span>
        </div>

        {merchs.length === 0 ? (
          <div className="border border-white/10 py-20 text-center">
            <p className="font-display text-2xl text-gray-700 uppercase tracking-widest">Nenhum produto ainda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {merchs.map((m) => (
              <div key={m.id} className="bg-black group relative flex flex-col">
                {/* Badge */}
                {m.description?.toLowerCase().includes('new') && (
                  <div className="absolute top-3 right-3 z-10 bg-white text-black font-body font-bold text-[9px] tracking-widest uppercase px-2 py-0.5">
                    NEW
                  </div>
                )}

                {/* Image */}
                {m.imageUrl ? (
                  <div className="aspect-square overflow-hidden bg-zinc-900">
                    <img
                      src={m.imageUrl}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-zinc-950 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-display text-lg uppercase tracking-wide leading-tight text-white">
                      {m.name}
                    </h3>
                    <span className="font-body font-bold text-sm text-white whitespace-nowrap shrink-0">
                      {m.price}
                    </span>
                  </div>

                  {m.description && (
                    <p className="font-body text-xs text-gray-600 mb-3 line-clamp-2">{m.description}</p>
                  )}

                  {/* Sizes */}
                  {m.sizes && m.sizes.length > 0 && (
                    <div className="flex gap-1.5 mb-4">
                      {m.sizes.map((size) => (
                        <span
                          key={size}
                          className="border border-white/20 text-white/60 font-body font-bold text-[10px] tracking-widest uppercase px-2 py-1"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto">
                    {m.link ? (
                      <a
                        href={m.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center border border-white/30 hover:border-white text-white/70 hover:text-white font-body font-bold text-[10px] tracking-[0.25em] uppercase py-3 transition-colors"
                      >
                        ADD TO CART
                      </a>
                    ) : (
                      <div className="w-full text-center border border-white/10 text-white/20 font-body font-bold text-[10px] tracking-[0.25em] uppercase py-3">
                        ADD TO CART
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── PAYMENT METHODS ──────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 py-10 border-b border-white/10">
        <div className="mb-6">
          <h2 className="font-display text-xs font-bold tracking-[0.3em] uppercase text-white mb-1">
            PAYMENT METHODS
          </h2>
          <p className="font-body text-xs text-gray-600">Secured transactions for the modern collector.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/10 max-w-lg">
          {[
            { label: 'PIX', sub: 'INSTANT 5% OFF' },
            { label: 'CREDIT', sub: 'UP TO 12X' },
            { label: 'CRYPTO', sub: 'BTC/ETH' },
          ].map(({ label, sub }) => (
            <div key={label} className="bg-black px-5 py-4">
              <p className="font-body text-[9px] font-bold tracking-[0.25em] uppercase text-gray-500 mb-0.5">{label}</p>
              <p className="font-body text-[9px] tracking-widest uppercase text-gray-700">{sub}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

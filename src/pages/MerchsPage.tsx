import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { Merch } from '../types';
import { formatPrice } from '../lib/utils';

const STUDIO_PHONE = '554699704747';

/* ─── helpers ─── */
function categorizeMerchs(merchs: Merch[]) {
  const prints     = merchs.filter((m) => m.category === 'prints');
  const vestuario  = merchs.filter((m) => m.category === 'vestuario');
  const acessorios = merchs.filter((m) => m.category === 'acessorios');
  // Products without a category set go into a fallback bucket
  const uncategorized = merchs.filter((m) => !m.category);
  return { prints, vestuario, acessorios, uncategorized };
}

/* ─── Cart icon ─── */
function CartIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}

/* ─── Print card (2-col portrait) ─── */
function PrintCard({ m }: { m: Merch }) {
  const addToCart = useStore((s) => s.addToCart);
  const publicUser = useStore((s) => s.publicUser);
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!publicUser) {
      navigate('/login');
      return;
    }
    addToCart('merch', m.id);
  };

  return (
    <div className="flex flex-col group">
      <div className="aspect-[4/5] bg-zinc-900 overflow-hidden mb-3 relative rounded-sm border border-zinc-800/50">
        {m.imageUrl ? (
          <img
            src={m.imageUrl}
            alt={m.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* ADD TO CART OVERLAY - now with a clearer button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center px-4">
          <button
            onClick={handleAdd}
            className="w-full py-3 bg-white text-black font-body text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-zinc-200"
          >
            <CartIcon className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-start gap-2">
          <p className="font-body text-[11px] font-bold tracking-widest uppercase text-white leading-tight truncate flex-1">
            {m.name}
          </p>
          <p className="font-body text-[11px] font-bold text-ink-500 shrink-0">{formatPrice(m.price)}</p>
        </div>
        {m.description && (
          <p className="font-body text-[10px] text-zinc-500 leading-snug line-clamp-1 italic">{m.description}</p>
        )}
        <button
          onClick={handleAdd}
          className="mt-2 w-full py-2 border border-zinc-800 text-zinc-400 font-body text-[9px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all md:hidden"
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}

/* ─── Vestuário card (2-col, taller, with sizes + cart) ─── */
function VestuarioCard({ m }: { m: Merch }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(m.sizes?.[0] ?? null);
  const addToCart = useStore((s) => s.addToCart);
  const publicUser = useStore((s) => s.publicUser);
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!publicUser) {
      navigate('/login');
      return;
    }
    addToCart('merch', m.id, selectedSize ?? undefined);
  };

  return (
    <div className="flex flex-col group bg-black/20 border border-zinc-900 hover:border-zinc-700 transition-colors">
      <div className="aspect-[4/5] bg-zinc-900 overflow-hidden relative">
        {m.imageUrl ? (
          <img
            src={m.imageUrl}
            alt={m.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Size selector overlay */}
        {m.sizes && m.sizes.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1 z-10">
            {m.sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                className={`font-body text-[9px] font-bold tracking-wide uppercase px-2 py-1 transition-all border ${
                  selectedSize === size
                    ? 'bg-white text-black border-white'
                    : 'bg-black/60 text-white/50 border-white/10 hover:border-white/40'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* ADD TO CART OVERLAY */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center px-4">
          <button
            onClick={handleAdd}
            className="w-full py-3 bg-white text-black font-body text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-zinc-200 shadow-xl"
          >
            <CartIcon className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-body text-[11px] font-bold tracking-widest uppercase text-zinc-300 leading-tight flex-1">
            {m.name}
          </p>
          <p className="font-body text-[11px] font-bold text-ink-500 shrink-0">{formatPrice(m.price)}</p>
        </div>
        {m.description && (
          <p className="font-body text-[10px] text-zinc-600 mt-1 leading-snug line-clamp-1 italic">{m.description}</p>
        )}
        <button
          onClick={handleAdd}
          className="mt-3 w-full py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-body text-[9px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all md:hidden"
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}

/* ─── Acessório card (3-col, square) ─── */
function AcessorioCard({ m }: { m: Merch }) {
  const addToCart = useStore((s) => s.addToCart);
  const publicUser = useStore((s) => s.publicUser);
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!publicUser) {
      navigate('/login');
      return;
    }
    addToCart('merch', m.id);
  };

  return (
    <div className="flex flex-col group">
      <div className="aspect-[4/5] bg-zinc-900 overflow-hidden mb-3 relative rounded-sm border border-zinc-800/50">
        {m.imageUrl ? (
          <img
            src={m.imageUrl}
            alt={m.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* ADD TO CART OVERLAY */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center px-4">
          <button
            onClick={handleAdd}
            className="w-full py-3 bg-white text-black font-body text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-zinc-200"
          >
            <CartIcon className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-start gap-2">
          <p className="font-body text-[11px] font-bold tracking-widest uppercase text-white leading-tight truncate flex-1">
            {m.name}
          </p>
          <p className="font-body text-[11px] font-bold text-ink-500 shrink-0">{formatPrice(m.price)}</p>
        </div>
        <button
          onClick={handleAdd}
          className="mt-2 w-full py-2 border border-zinc-800 text-zinc-400 font-body text-[9px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all md:hidden"
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}

/* ─── Category header ─── */
function CategoryHeader({ index, title }: { index: number; title: string }) {
  return (
    <div className="px-4 pt-8 pb-4">
      <p className="font-body text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-600 mb-1">
        CATEGORIA_0{index}
      </p>
      <h2 className="font-display text-3xl md:text-4xl uppercase leading-none text-white tracking-tight">
        {title}
      </h2>
    </div>
  );
}

/* ─── Main page ─── */
export default function MerchsPage() {
  const merchs = useStore((s) => s.merchs);
  const shop = useStore((s) => s.shopContent);
  const [email, setEmail] = useState('');

  const { prints, vestuario, acessorios, uncategorized } = categorizeMerchs(merchs);
  const allEmpty = merchs.length === 0;

  return (
    <div className="min-h-screen bg-black text-white pb-20 md:pb-0">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="px-4 lg:px-12 pt-10 pb-6 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-5xl md:text-6xl lg:text-8xl uppercase leading-none tracking-tight text-white">
            {shop.hero.title}
          </h1>
          <p className="font-body text-[10px] font-bold tracking-widest uppercase text-zinc-500 mt-2">
            — {shop.hero.subtitle}
          </p>
        </div>
      </section>

      {allEmpty && (
        <div className="px-4 py-20 text-center">
          <p className="font-display text-2xl text-zinc-700 uppercase tracking-widest">Nenhum produto ainda</p>
        </div>
      )}

      {/* ── PRINTS ───────────────────────────────────────────────────── */}
      {prints.length > 0 && (
        <section className="border-b border-zinc-800">
          <div className="max-w-7xl mx-auto">
            <CategoryHeader index={1} title="Prints" />
            <div className="px-4 lg:px-12 pb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
                {prints.map((m) => (
                  <PrintCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── VESTUÁRIO ────────────────────────────────────────────────── */}
      {vestuario.length > 0 && (
        <section className="border-b border-zinc-800">
          <div className="max-w-7xl mx-auto">
            <CategoryHeader index={2} title="Vestuário" />
            <div className="px-4 lg:px-12 pb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {vestuario.map((m) => (
                  <VestuarioCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ACESSÓRIOS ───────────────────────────────────────────────── */}
      {acessorios.length > 0 && (
        <section className="border-b border-zinc-800">
          <div className="max-w-7xl mx-auto">
            <CategoryHeader index={3} title="Acessórios" />
            <div className="px-4 lg:px-12 pb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
                {acessorios.map((m) => (
                  <AcessorioCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Uncategorized products — shown last in 2-col grid */}
      {uncategorized.length > 0 && (
        <section className="border-b border-zinc-800">
          <div className="max-w-7xl mx-auto">
            <CategoryHeader index={prints.length + vestuario.length + acessorios.length > 0 ? 4 : 1} title="Produtos" />
            <div className="px-4 lg:px-12 pb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
                {uncategorized.map((m) => (
                  <PrintCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER ───────────────────────────────────────────────── */}
      <section className="px-4 lg:px-12 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto lg:flex lg:items-end lg:justify-between lg:gap-16">
          <div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl uppercase leading-none text-white mb-3">
              Mantenha-se<br />tatuado.
            </h2>
            <p className="font-body text-xs text-zinc-500 mb-6 leading-relaxed max-w-xs">
              Assine para acesso antecipado a lançamentos exclusivos e ofertas sazonais do estúdio.
            </p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
            className="flex gap-2 max-w-sm w-full lg:max-w-md lg:mb-1"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@dominio.com"
              className="flex-1 bg-transparent border border-zinc-700 px-3 py-2.5 font-body text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-white text-black font-body text-[10px] font-bold tracking-widest uppercase hover:bg-zinc-200 transition-colors shrink-0"
            >
              Enviar
            </button>
          </form>
        </div>
      </section>

      {/* ── BOTTOM TAB BAR (mobile) ───────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex md:hidden z-50">
        {[
          { label: 'Tattoos', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
          )},
          { label: 'Vestuário', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          )},
          { label: 'Acessórios', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          )},
          { label: 'Conta', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )},
        ].map(({ label, icon }) => (
          <button
            key={label}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-zinc-600 hover:text-white transition-colors"
          >
            {icon}
            <span className="font-body text-[8px] font-bold tracking-widest uppercase">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

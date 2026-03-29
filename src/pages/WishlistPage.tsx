import { Link } from 'react-router-dom';
import { useStore } from '../store';

export default function WishlistPage() {
  const publicUser = useStore((s) => s.publicUser);
  const wishlist = useStore((s) => s.wishlist);
  const tattoos = useStore((s) => s.tattoos);
  const merchs = useStore((s) => s.merchs);
  const removeFromWishlist = useStore((s) => s.removeFromWishlist);
  const moveToCart = useStore((s) => s.moveToCart);
  const cart = useStore((s) => s.cart);

  if (!publicUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="font-body text-xs text-gray-500 tracking-widest uppercase">Faça login para ver sua lista de desejos</p>
        <Link to="/login" className="font-body text-xs font-bold tracking-widest uppercase bg-white text-black px-6 py-3 hover:bg-white/90 transition-colors">
          Entrar
        </Link>
      </div>
    );
  }

  const items = wishlist.map((w) => {
    if (w.itemType === 'tattoo') {
      const t = tattoos.find((x) => x.id === w.itemId);
      if (!t) return null;
      return { ...w, name: t.title, image: t.imageUrl, price: t.price ?? 'Consultar', subtitle: 'Design de tatuagem' };
    } else {
      const m = merchs.find((x) => x.id === w.itemId);
      if (!m) return null;
      return { ...w, name: m.name, image: m.imageUrl, price: m.price, subtitle: 'Produto' };
    }
  }).filter(Boolean) as { itemType: 'tattoo' | 'merch'; itemId: string; name: string; image: string; price: string; subtitle: string }[];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-1">Sua conta</p>
          <h1 className="font-display text-4xl uppercase tracking-wide text-white">Lista de Desejos</h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <p className="font-body text-xs text-gray-600 tracking-widest uppercase">Sua lista de desejos está vazia</p>
            <Link to="/" className="font-body text-xs font-bold tracking-widest uppercase border border-white/20 text-white px-6 py-2.5 hover:bg-white hover:text-black transition-colors">
              Explorar designs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => {
              const inCart = cart.some((c) => c.itemType === item.itemType && c.itemId === item.itemId);
              return (
                <div key={`${item.itemType}-${item.itemId}`} className="border border-white/10 bg-black/20 group">
                  <div className="aspect-square overflow-hidden bg-zinc-900">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <p className="font-body text-[10px] text-gray-600 tracking-widest uppercase mb-1">{item.subtitle}</p>
                    <h3 className="font-display text-lg uppercase tracking-wide text-white truncate mb-0.5">{item.name}</h3>
                    <p className="font-body text-sm text-ink-500 mb-4">{item.price}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveToCart(item.itemType, item.itemId)}
                        disabled={inCart}
                        className="flex-1 font-body text-[10px] font-bold tracking-widest uppercase py-2 bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {inCart ? 'No carrinho' : 'Mover p/ carrinho'}
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.itemType, item.itemId)}
                        className="px-3 py-2 border border-white/10 text-gray-600 hover:text-red-400 hover:border-red-400/30 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export default function CartPage() {
  const publicUser = useStore((s) => s.publicUser);
  const cart = useStore((s) => s.cart);
  const tattoos = useStore((s) => s.tattoos);
  const merchs = useStore((s) => s.merchs);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!publicUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="font-body text-xs text-gray-500 tracking-widest uppercase">Faça login para acessar seu carrinho</p>
        <Link to="/login" className="font-body text-xs font-bold tracking-widest uppercase bg-white text-black px-6 py-3 hover:bg-white/90 transition-colors">
          Entrar
        </Link>
      </div>
    );
  }

  const items = cart.map((c) => {
    if (c.itemType === 'tattoo') {
      const t = tattoos.find((x) => x.id === c.itemId);
      if (!t) return null;
      const cents = t.depositAmount ?? 15000;
      return { ...c, name: t.title, image: t.imageUrl, priceCents: cents, priceLabel: `Sinal: R$${(cents / 100).toFixed(2).replace('.', ',')}`, subtitle: 'Reserva de design' };
    } else {
      const m = merchs.find((x) => x.id === c.itemId);
      if (!m) return null;
      const cents = Math.round(parseFloat(m.price.replace(/[^0-9.,]/g, '').replace(',', '.')) * 100) || 0;
      return { ...c, name: m.name, image: m.imageUrl, priceCents: cents, priceLabel: m.price, subtitle: 'Produto' };
    }
  }).filter(Boolean) as { itemType: 'tattoo' | 'merch'; itemId: string; name: string; image: string; priceCents: number; priceLabel: string; subtitle: string }[];

  const totalCents = items.reduce((sum, i) => sum + i.priceCents, 0);

  async function handleCheckout() {
    if (!publicUser) { navigate('/login'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: publicUser.id,
          email: publicUser.email,
          items: items.map((i) => ({ itemType: i.itemType, itemId: i.itemId, name: i.name, image: i.image, priceCents: i.priceCents })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error ?? 'Erro ao criar sessão de pagamento');
      window.location.href = json.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-1">Finalizar</p>
          <h1 className="font-display text-4xl uppercase tracking-wide text-white">Carrinho</h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <p className="font-body text-xs text-gray-600 tracking-widest uppercase">Seu carrinho está vazio</p>
            <Link to="/" className="font-body text-xs font-bold tracking-widest uppercase border border-white/20 text-white px-6 py-2.5 hover:bg-white hover:text-black transition-colors">
              Explorar designs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
            {/* Items */}
            <ul className="divide-y divide-white/5">
              {items.map((item) => (
                <li key={`${item.itemType}-${item.itemId}`} className="flex gap-4 py-5">
                  <div className="w-20 h-20 shrink-0 bg-zinc-900 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[10px] text-gray-600 tracking-widest uppercase mb-0.5">{item.subtitle}</p>
                    <h3 className="font-display text-lg uppercase tracking-wide text-white truncate">{item.name}</h3>
                    <p className="font-body text-sm text-ink-500 mt-1">{item.priceLabel}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.itemType, item.itemId)} className="text-gray-700 hover:text-red-400 transition-colors self-start mt-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <div className="border border-white/10 bg-black/20 p-6 sticky top-4">
              <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-4">Resumo</h2>
              <div className="flex justify-between mb-2">
                <span className="font-body text-sm text-gray-400">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
                <span className="font-body text-sm text-white">R${(totalCents / 100).toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="border-t border-white/10 my-4" />
              <div className="flex justify-between mb-6">
                <span className="font-body text-xs font-bold tracking-widest uppercase text-white">Total</span>
                <span className="font-display text-xl text-white">R${(totalCents / 100).toFixed(2).replace('.', ',')}</span>
              </div>
              {error && (
                <div className="mb-4 px-3 py-2 border border-red-500/30 bg-red-500/10">
                  <p className="font-body text-xs text-red-400">{error}</p>
                </div>
              )}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-white text-black font-body text-xs font-bold tracking-widest uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Redirecionando...' : 'Pagar com Stripe'}
              </button>
              <p className="font-body text-[10px] text-gray-700 text-center mt-3">
                Pagamento seguro via Stripe
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

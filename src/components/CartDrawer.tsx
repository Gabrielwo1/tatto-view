import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const cart = useStore((s) => s.cart);
  const tattoos = useStore((s) => s.tattoos);
  const merchs = useStore((s) => s.merchs);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const publicUser = useStore((s) => s.publicUser);
  const navigate = useNavigate();

  if (!open) return null;

  const items = cart.map((c) => {
    if (c.itemType === 'tattoo') {
      const t = tattoos.find((x) => x.id === c.itemId);
      if (!t) return null;
      return { ...c, name: t.title, image: t.imageUrl, price: t.depositAmount ? `Sinal: R$${(t.depositAmount / 100).toFixed(2)}` : t.price ?? 'Consultar' };
    } else {
      const m = merchs.find((x) => x.id === c.itemId);
      if (!m) return null;
      return { ...c, name: m.name, image: m.imageUrl, price: m.price };
    }
  }).filter(Boolean) as { itemType: 'tattoo' | 'merch'; itemId: string; name: string; image: string; price: string }[];

  function handleCheckout() {
    onClose();
    navigate('/carrinho');
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-zinc-950 border-l border-white/10 z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-display text-xl uppercase tracking-wide text-white">Carrinho</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <svg className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="font-body text-xs text-gray-600 tracking-widest uppercase">Carrinho vazio</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {items.map((item) => (
                <li key={`${item.itemType}-${item.itemId}`} className="flex gap-3 px-5 py-4">
                  <div className="w-16 h-16 shrink-0 bg-zinc-900 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm uppercase tracking-wide text-white truncate">{item.name}</p>
                    <p className="font-body text-xs text-ink-500 mt-0.5">{item.price}</p>
                    <p className="font-body text-[10px] text-gray-700 uppercase tracking-widest mt-0.5">
                      {item.itemType === 'tattoo' ? 'Reserva de design' : 'Produto'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.itemType, item.itemId)}
                    className="text-gray-700 hover:text-red-400 transition-colors self-start mt-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10">
            {!publicUser && (
              <p className="font-body text-[10px] text-gray-600 text-center mb-3 tracking-widest uppercase">
                Faça login para finalizar
              </p>
            )}
            <button
              onClick={handleCheckout}
              className="w-full bg-white text-black font-body text-xs font-bold tracking-widest uppercase py-3 hover:bg-white/90 transition-colors"
            >
              Finalizar pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
}

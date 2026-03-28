import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

export default function CheckoutSuccessPage() {
  const loadCart = useStore((s) => s.loadCart);

  useEffect(() => {
    // Reload cart (it may have been cleared server-side by webhook)
    loadCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 text-center px-6">
      <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide text-white mb-2">Pedido confirmado!</h1>
        <p className="font-body text-sm text-gray-500 max-w-sm">
          Seu sinal foi recebido. Em breve entraremos em contato para agendar sua sessão.
        </p>
      </div>
      <Link to="/" className="font-body text-xs font-bold tracking-widest uppercase bg-white text-black px-8 py-3 hover:bg-white/90 transition-colors">
        Voltar à vitrine
      </Link>
    </div>
  );
}

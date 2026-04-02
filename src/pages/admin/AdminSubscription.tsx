import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';

function daysLeft(isoDate: string | null): number {
  if (!isoDate) return 0;
  return Math.max(0, Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86_400_000));
}

export default function AdminSubscription() {
  const subscriptionStatus = useStore((s) => s.subscriptionStatus);
  const trialEndsAt        = useStore((s) => s.trialEndsAt);
  const currentUserEmail   = useStore((s) => s.currentUserEmail);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [searchParams]          = useSearchParams();
  const statusParam             = searchParams.get('status');

  // If already active, show a success state
  const isActive = subscriptionStatus === 'active';
  const remaining = daysLeft(trialEndsAt);
  const trialExpired = trialEndsAt ? new Date(trialEndsAt) < new Date() : false;

  // Get supabase user id from session
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    import('../../lib/supabase').then(({ supabase }) => {
      supabase?.auth.getUser().then(({ data }) => {
        if (data?.user) setUserId(data.user.id);
      });
    });
  }, []);

  async function handleSubscribe() {
    if (!userId || !currentUserEmail) {
      setError('Você precisa estar logado para assinar.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: currentUserEmail }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Erro ao criar sessão de pagamento.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Success after payment */}
        {statusParam === 'sucesso' && (
          <div className="border border-white/20 p-4 mb-8 text-center">
            <p className="font-body text-xs font-semibold tracking-widest uppercase text-green-400">
              Pagamento confirmado! Seu acesso está ativo.
            </p>
          </div>
        )}

        {/* Active subscription */}
        {isActive && statusParam !== 'sucesso' && (
          <div className="border border-white/20 p-4 mb-8 text-center">
            <p className="font-body text-xs font-semibold tracking-widest uppercase text-white/60">
              Sua assinatura está ativa.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-2">Plano</p>
          <h1 className="font-display text-5xl text-white uppercase tracking-wide leading-none mb-4">
            Vitrink Pro
          </h1>
          <p className="font-body text-sm text-gray-500">
            {trialExpired
              ? 'Seu período gratuito encerrou. Continue usando a plataforma com uma assinatura mensal.'
              : remaining > 0
                ? `Você tem ${remaining} dia${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''} no seu trial gratuito.`
                : 'Ative sua assinatura para continuar acessando o painel.'}
          </p>
        </div>

        {/* Plan card */}
        <div className="border border-white/15 p-8 mb-6">
          <div className="flex items-baseline gap-2 mb-6">
            <span className="font-display text-6xl text-white leading-none">R$39</span>
            <span className="font-display text-3xl text-white/60">,90</span>
            <span className="font-body text-xs text-gray-600 tracking-widest uppercase ml-1">/mês</span>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              'Galeria de artes ilimitada',
              'Gestão de artistas',
              'Ficha de anamnese digital',
              'Página de eventos e guests',
              'Loja de merch integrada',
              'Financeiro do estúdio',
              'Landing page personalizada',
              'Suporte via WhatsApp',
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 font-body text-sm text-gray-400">
                <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          {error && (
            <p className="font-body text-xs text-red-400 mb-4">{error}</p>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading || isActive}
            className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-black font-body font-bold text-sm tracking-widest uppercase py-4 transition-colors"
          >
            {loading ? 'Aguarde...' : isActive ? 'Assinatura Ativa' : 'Assinar Agora'}
          </button>

          <p className="font-body text-xs text-gray-700 text-center mt-3">
            Cancele quando quiser. Sem fidelidade.
          </p>
        </div>

        {/* Trial info */}
        {!trialExpired && remaining > 0 && !isActive && (
          <p className="font-body text-xs text-gray-700 text-center">
            Seu trial termina em {new Date(trialEndsAt!).toLocaleDateString('pt-BR')}.
            Você pode assinar agora ou aguardar.
          </p>
        )}
      </div>
    </div>
  );
}

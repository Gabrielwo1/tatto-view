import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';

function daysUntil(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function BillingPage() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success') === '1';

  const subscriptionStatus = useStore((s) => s.subscriptionStatus);
  const trialEndsAt = useStore((s) => s.trialEndsAt);
  const loadSubscription = useStore((s) => s.loadSubscription);
  const isAdmin = useStore((s) => s.isAdmin);
  const isArtist = useStore((s) => s.isArtist);
  const isMerchManager = useStore((s) => s.isMerchManager);
  const currentUserEmail = useStore((s) => s.currentUserEmail);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserId = async (): Promise<string | null> => {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    );
    const { data: { session } } = await client.auth.getSession();
    return session?.user?.id ?? null;
  };

  const handleStartSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = await getUserId();
      if (!userId || !currentUserEmail) throw new Error('Usuário não identificado');
      const res = await fetch('/api/create-subscription-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: currentUserEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao criar sessão');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('Usuário não identificado');
      const res = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao abrir portal');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const trialDays = daysUntil(trialEndsAt);
  const isStaff = isAdmin || isArtist || isMerchManager;

  const statusLabel: Record<string, string> = {
    trialing: 'Período de teste',
    active: 'Ativo',
    past_due: 'Pagamento pendente',
    canceled: 'Cancelado',
    unpaid: 'Inadimplente',
  };

  const statusColor: Record<string, string> = {
    trialing: 'text-blue-400',
    active: 'text-green-400',
    past_due: 'text-yellow-400',
    canceled: 'text-red-400',
    unpaid: 'text-red-400',
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6 space-y-8">
      <h1 className="font-display text-3xl uppercase tracking-wide text-white">Plano & Cobrança</h1>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded p-4 text-sm text-green-400">
          Plano ativado com sucesso! Bem-vindo ao período de teste.
        </div>
      )}

      {/* Status card */}
      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-body text-xs tracking-widest uppercase text-gray-500">Status do plano</span>
          {subscriptionStatus ? (
            <span className={`font-body text-sm font-semibold ${statusColor[subscriptionStatus] ?? 'text-gray-400'}`}>
              {statusLabel[subscriptionStatus] ?? subscriptionStatus}
            </span>
          ) : (
            <span className="font-body text-sm text-gray-500">Sem plano ativo</span>
          )}
        </div>

        {subscriptionStatus === 'trialing' && trialDays !== null && (
          <div className="flex items-center justify-between">
            <span className="font-body text-xs tracking-widest uppercase text-gray-500">Dias restantes</span>
            <span className="font-body text-sm font-semibold text-white">{trialDays} {trialDays === 1 ? 'dia' : 'dias'}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-body text-xs tracking-widest uppercase text-gray-500">Plano</span>
          <span className="font-body text-sm text-white">Plano mensal — R$39,90/mês</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Actions */}
      {isStaff && (
        <div className="space-y-3">
          {!subscriptionStatus || subscriptionStatus === 'canceled' || subscriptionStatus === 'unpaid' ? (
            <button
              onClick={handleStartSubscription}
              disabled={loading}
              className="w-full font-body text-xs font-bold tracking-widest uppercase bg-white text-black px-8 py-3 hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : 'Começar 10 dias grátis'}
            </button>
          ) : (
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="w-full font-body text-xs font-bold tracking-widest uppercase bg-white text-black px-8 py-3 hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : 'Gerenciar plano / Cancelar'}
            </button>
          )}

          <button
            onClick={async () => { await loadSubscription(); }}
            className="w-full font-body text-xs tracking-widest uppercase text-gray-500 hover:text-white transition-colors py-2"
          >
            Atualizar status
          </button>
        </div>
      )}
    </div>
  );
}

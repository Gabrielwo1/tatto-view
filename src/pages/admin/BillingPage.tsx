import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';
import { useLang } from '../../lib/useLang';

const T = {
  pt: {
    title: 'Plano & Cobrança',
    successMsg: 'Plano ativado com sucesso! Bem-vindo ao período de teste.',
    statusLabel: 'Status do plano',
    noActivePlan: 'Sem plano ativo',
    daysLeft: 'Dias restantes',
    trialDays: (n: number) => `${n} ${n === 1 ? 'dia' : 'dias'}`,
    planLabel: 'Plano',
    planDescription: 'Plano mensal — R$39,90/mês',
    statusTrialing: 'Período de teste',
    statusActive: 'Ativo',
    statusPastDue: 'Pagamento pendente',
    statusCanceled: 'Cancelado',
    statusUnpaid: 'Inadimplente',
    statusIncomplete: 'Pagamento incompleto',
    statusIncompleteExpired: 'Expirado',
    loading: 'Aguarde...',
    startTrial: 'Começar 10 dias grátis',
    managePlan: 'Gerenciar plano / Cancelar',
    refreshStatus: 'Atualizar status',
    errNotIdentified: 'Usuário não identificado',
    errCreateSession: 'Erro ao criar sessão',
    errOpenPortal: 'Erro ao abrir portal',
    errUnexpected: 'Erro inesperado',
  },
  en: {
    title: 'Plan & Billing',
    successMsg: 'Plan activated successfully! Welcome to your trial period.',
    statusLabel: 'Plan status',
    noActivePlan: 'No active plan',
    daysLeft: 'Days remaining',
    trialDays: (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
    planLabel: 'Plan',
    planDescription: 'Monthly plan — R$39.90/month',
    statusTrialing: 'Trial period',
    statusActive: 'Active',
    statusPastDue: 'Payment pending',
    statusCanceled: 'Canceled',
    statusUnpaid: 'Unpaid',
    statusIncomplete: 'Incomplete payment',
    statusIncompleteExpired: 'Expired',
    loading: 'Please wait...',
    startTrial: 'Start 10-day free trial',
    managePlan: 'Manage plan / Cancel',
    refreshStatus: 'Refresh status',
    errNotIdentified: 'User not identified',
    errCreateSession: 'Error creating session',
    errOpenPortal: 'Error opening portal',
    errUnexpected: 'Unexpected error',
  },
};

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

  const { lang } = useLang();
  const tr = T[lang];
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
      if (!userId || !currentUserEmail) throw new Error(tr.errNotIdentified);
      const res = await fetch('/api/create-subscription-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: currentUserEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? tr.errCreateSession);
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : tr.errUnexpected);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = await getUserId();
      if (!userId) throw new Error(tr.errNotIdentified);
      const res = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? tr.errOpenPortal);
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : tr.errUnexpected);
    } finally {
      setLoading(false);
    }
  };

  const trialDays = daysUntil(trialEndsAt);
  const isStaff = isAdmin || isArtist || isMerchManager;

  const statusLabel: Record<string, string> = {
    trialing: tr.statusTrialing,
    active: tr.statusActive,
    past_due: tr.statusPastDue,
    canceled: tr.statusCanceled,
    unpaid: tr.statusUnpaid,
    incomplete: tr.statusIncomplete,
    incomplete_expired: tr.statusIncompleteExpired,
  };

  const statusColor: Record<string, string> = {
    trialing: 'text-blue-400',
    active: 'text-green-400',
    past_due: 'text-yellow-400',
    canceled: 'text-red-400',
    unpaid: 'text-red-400',
    incomplete: 'text-yellow-400',
    incomplete_expired: 'text-red-400',
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6 space-y-8">
      <h1 className="font-display text-3xl uppercase tracking-wide text-white">{tr.title}</h1>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded p-4 text-sm text-green-400">
          {tr.successMsg}
        </div>
      )}

      {/* Status card */}
      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-body text-xs tracking-widest uppercase text-gray-500">{tr.statusLabel}</span>
          {subscriptionStatus ? (
            <span className={`font-body text-sm font-semibold ${statusColor[subscriptionStatus] ?? 'text-gray-400'}`}>
              {statusLabel[subscriptionStatus] ?? subscriptionStatus}
            </span>
          ) : (
            <span className="font-body text-sm text-gray-500">{tr.noActivePlan}</span>
          )}
        </div>

        {subscriptionStatus === 'trialing' && trialDays !== null && (
          <div className="flex items-center justify-between">
            <span className="font-body text-xs tracking-widest uppercase text-gray-500">{tr.daysLeft}</span>
            <span className="font-body text-sm font-semibold text-white">{tr.trialDays(trialDays)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-body text-xs tracking-widest uppercase text-gray-500">{tr.planLabel}</span>
          <span className="font-body text-sm text-white">{tr.planDescription}</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Actions */}
      {isStaff && (
        <div className="space-y-3">
          {!subscriptionStatus || subscriptionStatus === 'canceled' || subscriptionStatus === 'unpaid' || subscriptionStatus === 'incomplete' || subscriptionStatus === 'incomplete_expired' ? (
            <button
              onClick={handleStartSubscription}
              disabled={loading}
              className="w-full font-body text-xs font-bold tracking-widest uppercase bg-white text-black px-8 py-3 hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? tr.loading : tr.startTrial}
            </button>
          ) : (
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="w-full font-body text-xs font-bold tracking-widest uppercase bg-white text-black px-8 py-3 hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? tr.loading : tr.managePlan}
            </button>
          )}

          <button
            onClick={async () => { await loadSubscription(); }}
            className="w-full font-body text-xs tracking-widest uppercase text-gray-500 hover:text-white transition-colors py-2"
          >
            {tr.refreshStatus}
          </button>
        </div>
      )}
    </div>
  );
}

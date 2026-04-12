import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../../store';
import { useLang } from '../../lib/useLang';
import { PLANS, formatPrice, getPlanByMaxArtists, type Currency } from '../../lib/plans';

const T = {
  pt: {
    title: 'Plano & Cobrança',
    successMsg: 'Plano ativado com sucesso! Bem-vindo ao período de teste.',
    statusLabel: 'Status do plano',
    noActivePlan: 'Sem plano ativo',
    daysLeft: 'Dias restantes',
    trialDays: (n: number) => `${n} ${n === 1 ? 'dia' : 'dias'}`,
    currentPlan: 'Plano atual',
    artistsLabel: (n: number) => `${n} ${n === 1 ? 'tatuador' : 'tatuadores'}`,
    perMonth: '/mês',
    popular: 'Popular',
    statusTrialing: 'Período de teste',
    statusActive: 'Ativo',
    statusPastDue: 'Pagamento pendente',
    statusCanceled: 'Cancelado',
    statusUnpaid: 'Inadimplente',
    statusIncomplete: 'Pagamento incompleto',
    statusIncompleteExpired: 'Expirado',
    loading: 'Aguarde...',
    startTrial: 'Começar 20 dias grátis',
    selectPlan: 'Selecionar plano',
    managePlan: 'Gerenciar plano / Cancelar',
    refreshStatus: 'Atualizar status',
    errNotIdentified: 'Usuário não identificado',
    errCreateSession: 'Erro ao criar sessão',
    errOpenPortal: 'Erro ao abrir portal',
    errUnexpected: 'Erro inesperado',
    trialNote: '20 dias grátis · Sem cobrança imediata',
    choosePlan: 'Escolha seu plano',
    choosePlanSub: 'Todos os planos incluem 20 dias de teste gratuito.',
  },
  en: {
    title: 'Plan & Billing',
    successMsg: 'Plan activated successfully! Welcome to your trial period.',
    statusLabel: 'Plan status',
    noActivePlan: 'No active plan',
    daysLeft: 'Days remaining',
    trialDays: (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
    currentPlan: 'Current plan',
    artistsLabel: (n: number) => `${n} ${n === 1 ? 'artist' : 'artists'}`,
    perMonth: '/mo',
    popular: 'Popular',
    statusTrialing: 'Trial period',
    statusActive: 'Active',
    statusPastDue: 'Payment pending',
    statusCanceled: 'Canceled',
    statusUnpaid: 'Unpaid',
    statusIncomplete: 'Incomplete payment',
    statusIncompleteExpired: 'Expired',
    loading: 'Please wait...',
    startTrial: 'Start 20-day free trial',
    selectPlan: 'Select plan',
    managePlan: 'Manage plan / Cancel',
    refreshStatus: 'Refresh status',
    errNotIdentified: 'User not identified',
    errCreateSession: 'Error creating session',
    errOpenPortal: 'Error opening portal',
    errUnexpected: 'Unexpected error',
    trialNote: '20-day free trial · No immediate charge',
    choosePlan: 'Choose your plan',
    choosePlanSub: 'All plans include a 20-day free trial.',
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
  const maxArtists = useStore((s) => s.maxArtists);
  const loadSubscription = useStore((s) => s.loadSubscription);
  const isAdmin = useStore((s) => s.isAdmin);
  const isArtist = useStore((s) => s.isArtist);
  const isMerchManager = useStore((s) => s.isMerchManager);
  const currentUserEmail = useStore((s) => s.currentUserEmail);

  const { lang } = useLang();
  const tr = T[lang];
  const [loading, setLoading] = useState<string | null>(null); // planKey being loaded
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>('brl');

  const hasActivePlan = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
  const currentPlan = getPlanByMaxArtists(maxArtists);

  const getUserId = async (): Promise<string | null> => {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    );
    const { data: { session } } = await client.auth.getSession();
    return session?.user?.id ?? null;
  };

  const handleSelectPlan = async (planKey: string) => {
    setLoading(planKey);
    setError(null);
    try {
      const userId = await getUserId();
      if (!userId || !currentUserEmail) throw new Error(tr.errNotIdentified);
      const res = await fetch('/api/create-subscription-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: currentUserEmail, planKey, currency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? tr.errCreateSession);
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : tr.errUnexpected);
    } finally {
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading('portal');
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
      setLoading(null);
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
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-10">
      <h1 className="font-display text-3xl uppercase tracking-wide text-white">{tr.title}</h1>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded p-4 text-sm text-green-400">
          {tr.successMsg}
        </div>
      )}

      {/* Status card — only when plan is active */}
      {subscriptionStatus && (
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs tracking-widest uppercase text-gray-500">{tr.statusLabel}</span>
            <span className={`font-body text-sm font-semibold ${statusColor[subscriptionStatus] ?? 'text-gray-400'}`}>
              {statusLabel[subscriptionStatus] ?? subscriptionStatus}
            </span>
          </div>

          {subscriptionStatus === 'trialing' && trialDays !== null && (
            <div className="flex items-center justify-between">
              <span className="font-body text-xs tracking-widest uppercase text-gray-500">{tr.daysLeft}</span>
              <span className="font-body text-sm font-semibold text-white">{tr.trialDays(trialDays)}</span>
            </div>
          )}

          {currentPlan && (
            <div className="flex items-center justify-between">
              <span className="font-body text-xs tracking-widest uppercase text-gray-500">{tr.currentPlan}</span>
              <span className="font-body text-sm text-white">
                {lang === 'pt' ? currentPlan.namePT : currentPlan.nameEN} — {tr.artistsLabel(currentPlan.maxArtists)}
              </span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Manage plan button — for active/trialing users */}
      {isStaff && hasActivePlan && (
        <button
          onClick={handleManageBilling}
          disabled={loading === 'portal'}
          className="font-body text-xs font-bold tracking-widest uppercase bg-white text-black px-8 py-3 hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {loading === 'portal' ? tr.loading : tr.managePlan}
        </button>
      )}

      {/* ── Plan cards ── */}
      {isStaff && (
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl uppercase tracking-wide text-white">{tr.choosePlan}</h2>
              <p className="font-body text-xs text-gray-500 mt-1">{tr.choosePlanSub}</p>
            </div>

            {/* Currency toggle */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 p-1">
              {(['brl', 'usd', 'eur'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`font-body text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 transition-colors ${
                    currency === c ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const isCurrentPlan = currentPlan?.key === plan.key;
              const isLoading = loading === plan.key;
              const canSubscribe = !hasActivePlan || subscriptionStatus === 'canceled' || subscriptionStatus === 'unpaid' || subscriptionStatus === 'incomplete' || subscriptionStatus === 'incomplete_expired';
              const planName = lang === 'pt' ? plan.namePT : plan.nameEN;

              return (
                <div
                  key={plan.key}
                  className={`relative border rounded-lg p-6 flex flex-col gap-4 transition-colors ${
                    isCurrentPlan
                      ? 'border-white/60 bg-white/[0.06]'
                      : plan.popular
                      ? 'border-white/30 bg-zinc-900'
                      : 'border-white/10 bg-zinc-900 hover:border-white/20'
                  }`}
                >
                  {plan.popular && !isCurrentPlan && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black font-body text-[10px] font-bold tracking-widest uppercase px-3 py-1">
                      {tr.popular}
                    </span>
                  )}
                  {isCurrentPlan && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black font-body text-[10px] font-bold tracking-widest uppercase px-3 py-1">
                      {tr.currentPlan}
                    </span>
                  )}

                  <div>
                    <p className="font-display text-xl uppercase tracking-wide text-white">{planName}</p>
                    <p className="font-body text-xs text-gray-500 mt-0.5">{tr.artistsLabel(plan.maxArtists)}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl text-white">{formatPrice(plan, currency)}</span>
                    <span className="font-body text-xs text-gray-500">{tr.perMonth}</span>
                  </div>

                  {canSubscribe ? (
                    <button
                      onClick={() => handleSelectPlan(plan.key)}
                      disabled={isLoading || loading !== null}
                      className={`mt-auto font-body text-xs font-bold tracking-widest uppercase px-4 py-2.5 transition-colors disabled:opacity-50 ${
                        plan.popular || isCurrentPlan
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'border border-white/20 text-white hover:bg-white/5'
                      }`}
                    >
                      {isLoading ? tr.loading : tr.startTrial}
                    </button>
                  ) : (
                    <Link
                      to="#"
                      onClick={(e) => { e.preventDefault(); handleManageBilling(); }}
                      className={`mt-auto text-center font-body text-xs font-bold tracking-widest uppercase px-4 py-2.5 transition-colors ${
                        isCurrentPlan
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'border border-white/20 text-white hover:bg-white/5'
                      }`}
                    >
                      {isCurrentPlan ? tr.managePlan : tr.selectPlan}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <p className="font-body text-[10px] tracking-widest uppercase text-gray-600 text-center">
            {tr.trialNote}
          </p>
        </div>
      )}

      <button
        onClick={async () => { await loadSubscription(); }}
        className="font-body text-xs tracking-widest uppercase text-gray-600 hover:text-white transition-colors py-2"
      >
        {tr.refreshStatus}
      </button>
    </div>
  );
}

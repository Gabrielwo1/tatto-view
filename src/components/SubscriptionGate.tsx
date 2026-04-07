import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';

interface Props {
  children: ReactNode;
}

export default function SubscriptionGate({ children }: Props) {
  const subscriptionStatus = useStore((s) => s.subscriptionStatus);
  const isAdmin = useStore((s) => s.isAdmin);
  const isArtist = useStore((s) => s.isArtist);
  const isMerchManager = useStore((s) => s.isMerchManager);
  const location = useLocation();

  const isStaffUser = isAdmin || isArtist || isMerchManager;
  const isBillingPage = location.pathname === '/admin/billing';

  // eldude.vitrink.app is the base studio — always has full access, no billing required
  const isBaseStudio = window.location.hostname === 'eldude.vitrink.app';

  // Always allow: base studio, billing page, or active/trialing subscription
  if (!isStaffUser || isBaseStudio || isBillingPage || subscriptionStatus === 'trialing' || subscriptionStatus === 'active') {
    return <>{children}</>;
  }

  // No subscription yet (null) or expired/canceled
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 text-center px-6">
      <div className="w-16 h-16 rounded-full bg-ink-500/10 border border-ink-500/30 flex items-center justify-center">
        <svg className="w-8 h-8 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide text-white mb-2">
          {subscriptionStatus === null ? 'Ative seu plano' : 'Plano encerrado'}
        </h1>
        <p className="font-body text-sm text-gray-400 max-w-sm">
          {subscriptionStatus === null
            ? 'Para acessar o painel, ative seu plano. Os primeiros 10 dias são grátis, sem cobrança imediata.'
            : 'Seu plano está suspenso. Renove para voltar a usar o painel.'}
        </p>
      </div>
      <Link
        to="/admin/billing"
        className="font-body text-xs font-bold tracking-widest uppercase bg-white text-black px-8 py-3 hover:bg-white/90 transition-colors"
      >
        {subscriptionStatus === null ? 'Começar período grátis' : 'Gerenciar plano'}
      </Link>
    </div>
  );
}

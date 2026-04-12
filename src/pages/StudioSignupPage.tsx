import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLang, type Lang } from '../lib/useLang';
import { PLANS, getPlanByKey, formatPrice, type Currency } from '../lib/plans';

function detectCurrency(): Currency {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  const lang = navigator.language ?? '';
  const brTimezones = [
    'America/Sao_Paulo', 'America/Fortaleza', 'America/Recife',
    'America/Belem', 'America/Manaus', 'America/Cuiaba', 'America/Porto_Velho',
    'America/Boa_Vista', 'America/Santarem', 'America/Maceio', 'America/Bahia',
  ];
  if (brTimezones.includes(tz) || lang === 'pt-BR') return 'brl';
  if (tz.startsWith('Europe/')) return 'eur';
  return 'usd';
}

const T = {
  pt: {
    title: 'Criar seu studio',
    badge: '20 dias grátis · Sem cobrança imediata',
    selectedPlan: 'Plano selecionado',
    changePlan: 'Mudar plano',
    perMonth: '/mês',
    artist1: '1 tatuador',
    artistsN: (n: number) => `até ${n} tatuadores`,
    labelName: 'Nome do estúdio',
    placeholderName: 'Ex: Black Rose Tattoo',
    labelSubdomain: 'Subdomínio',
    placeholderSubdomain: 'blackrose',
    subdomainHint: 'Seu site ficará em',
    labelEmail: 'Email de acesso',
    placeholderEmail: 'seu@email.com',
    emailHint: 'Você receberá um link por email para definir sua senha.',
    btnLoading: 'Aguarde...',
    btnSubmit: 'Continuar para pagamento →',
    trust: [
      { label: '20 dias', sub: 'grátis' },
      { label: 'Cancele', sub: 'quando quiser' },
      { label: 'Stripe', sub: 'pagamento seguro' },
    ],
    back: '← Voltar',
    errorDefault: 'Erro ao processar. Tente novamente.',
    errorConnection: 'Erro de conexão. Tente novamente.',
  },
  en: {
    title: 'Create your studio',
    badge: '20-day free trial · No immediate charge',
    selectedPlan: 'Selected plan',
    changePlan: 'Change plan',
    perMonth: '/mo',
    artist1: '1 artist',
    artistsN: (n: number) => `up to ${n} artists`,
    labelName: 'Studio name',
    placeholderName: 'Ex: Black Rose Tattoo',
    labelSubdomain: 'Subdomain',
    placeholderSubdomain: 'blackrose',
    subdomainHint: 'Your site will be at',
    labelEmail: 'Access email',
    placeholderEmail: 'your@email.com',
    emailHint: 'You will receive an email link to set your password.',
    btnLoading: 'Please wait...',
    btnSubmit: 'Continue to payment →',
    trust: [
      { label: '20 days', sub: 'free' },
      { label: 'Cancel', sub: 'anytime' },
      { label: 'Stripe', sub: 'secure payment' },
    ],
    back: '← Back',
    errorDefault: 'Processing error. Please try again.',
    errorConnection: 'Connection error. Please try again.',
  },
} satisfies Record<Lang, unknown>;

export default function StudioSignupPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [searchParams] = useSearchParams();

  const paramPlan = searchParams.get('plan') ?? 'starter';
  const paramCurrency = searchParams.get('currency');

  const [planKey] = useState(() =>
    PLANS.some((p) => p.key === paramPlan) ? paramPlan : 'starter'
  );
  const [currency, setCurrency] = useState<Currency>(
    (['brl', 'usd', 'eur'] as Currency[]).includes(paramCurrency as Currency)
      ? (paramCurrency as Currency)
      : 'brl'
  );

  const [studioName, setStudioName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paramCurrency) setCurrency(detectCurrency());
  }, []);

  const selectedPlan = getPlanByKey(planKey) ?? PLANS[0];
  const planName = lang === 'pt' ? selectedPlan.namePT : selectedPlan.nameEN;
  const artistLabel = selectedPlan.maxArtists === 1
    ? t.artist1
    : t.artistsN(selectedPlan.maxArtists);

  function handleSubdomainInput(value: string) {
    setSubdomain(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/create-studio-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studioName, subdomain, email, planKey, currency }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.errorDefault);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError(t.errorConnection);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex justify-center mb-10">
          <img src="/vitrinklogo.png" alt="Vitrink" className="h-12 object-contain" />
        </Link>

        <div className="border border-white/10 bg-black/40 p-8">
          <h1 className="font-display text-3xl uppercase tracking-wide text-white mb-1">
            {t.title}
          </h1>
          <p className="font-body text-xs text-gray-500 tracking-widest uppercase mb-6">
            {t.badge}
          </p>

          {/* Selected plan */}
          <div className="flex items-center justify-between mb-5 p-4 border border-white/10 bg-white/[0.03]">
            <div>
              <p className="font-body text-[10px] text-gray-600 tracking-widest uppercase mb-0.5">
                {t.selectedPlan}
              </p>
              <p className="font-display text-base text-white uppercase tracking-wide">{planName}</p>
              <p className="font-body text-xs text-gray-500">
                {formatPrice(selectedPlan, currency)}{t.perMonth} · {artistLabel}
              </p>
            </div>
            <Link
              to="/#pricing"
              className="font-body text-[10px] text-gray-600 hover:text-white uppercase tracking-widest transition-colors"
            >
              {t.changePlan} →
            </Link>
          </div>

          {/* Currency selector */}
          <div className="flex gap-2 mb-6">
            {(['brl', 'usd', 'eur'] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`flex-1 py-1.5 text-[10px] font-body font-bold tracking-widest uppercase border transition-colors ${
                  currency === c
                    ? 'border-white/50 text-white bg-white/10'
                    : 'border-white/15 text-gray-500 hover:border-white/30 hover:text-gray-300'
                }`}
              >
                {c.toUpperCase()} · {formatPrice(selectedPlan, c)}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 border border-red-500/30 bg-red-500/10">
              <p className="font-body text-xs text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Studio name */}
            <div>
              <label className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">
                {t.labelName}
              </label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                required
                placeholder={t.placeholderName}
                className="w-full bg-transparent border border-white/15 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white/50 transition-colors"
              />
            </div>

            {/* Subdomain */}
            <div>
              <label className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">
                {t.labelSubdomain}
              </label>
              <div className="flex items-stretch">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => handleSubdomainInput(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  placeholder={t.placeholderSubdomain}
                  className="flex-1 bg-transparent border border-white/15 border-r-0 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white/50 transition-colors"
                />
                <span className="flex items-center px-3 bg-white/5 border border-white/15 text-gray-500 text-xs font-body whitespace-nowrap">
                  .vitrink.app
                </span>
              </div>
              {subdomain && (
                <p className="mt-1.5 font-body text-[10px] text-gray-500">
                  {t.subdomainHint}{' '}
                  <span className="text-white">{subdomain}.vitrink.app</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">
                {t.labelEmail}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t.placeholderEmail}
                className="w-full bg-transparent border border-white/15 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white/50 transition-colors"
              />
              <p className="mt-1.5 font-body text-[10px] text-gray-500">
                {t.emailHint}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-body text-xs font-bold tracking-widest uppercase py-3.5 hover:bg-white/90 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? t.btnLoading : t.btnSubmit}
            </button>
          </form>

          {/* Trust signals */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
            {t.trust.map((item) => (
              <div key={item.label}>
                <p className="font-body text-[10px] text-white font-semibold">{item.label}</p>
                <p className="font-body text-[10px] text-gray-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center mt-5">
          <Link to="/" className="font-body text-xs text-gray-700 hover:text-white transition-colors tracking-widest uppercase">
            {t.back}
          </Link>
        </p>
      </div>
    </div>
  );
}

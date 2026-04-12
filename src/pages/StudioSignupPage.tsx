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
    title: 'Criar seu estúdio',
    badge: '20 dias grátis · Sem cobrança imediata',
    selectedPlan: 'Plano selecionado',
    changePlan: 'Trocar plano',
    perMonth: '/mês',
    artist1: '1 tatuador',
    artistsN: (n: number) => `até ${n} tatuadores`,
    labelName: 'Nome do estúdio',
    placeholderName: 'Ex: Black Rose Tattoo',
    labelSubdomain: 'Endereço do site',
    placeholderSubdomain: 'blackrose',
    subdomainHint: 'Seu site ficará em',
    labelEmail: 'Seu e-mail',
    placeholderEmail: 'voce@email.com',
    emailHint: 'Você receberá um link para definir sua senha.',
    btnLoading: 'Aguarde...',
    btnSubmit: 'Continuar para pagamento →',
    trust: [
      { label: '20 dias', sub: 'grátis para testar' },
      { label: 'Cancele', sub: 'quando quiser' },
      { label: 'Stripe', sub: 'pagamento seguro' },
    ],
    features: [
      '8 páginas profissionais incluídas',
      'Painel de administração completo',
      'Upload ilimitado de tatuagens',
      'Backup automático na nuvem',
      '7 temas de cor para escolher',
      'Design responsivo — mobile + desktop',
      'Suporte para configuração inicial',
    ],
    included: 'O que você recebe',
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
    labelSubdomain: 'Website address',
    placeholderSubdomain: 'blackrose',
    subdomainHint: 'Your site will be at',
    labelEmail: 'Your email',
    placeholderEmail: 'you@email.com',
    emailHint: 'You will receive an email link to set your password.',
    btnLoading: 'Please wait...',
    btnSubmit: 'Continue to payment →',
    trust: [
      { label: '20 days', sub: 'free trial' },
      { label: 'Cancel', sub: 'anytime' },
      { label: 'Stripe', sub: 'secure payment' },
    ],
    features: [
      '8 professional pages included',
      'Complete admin panel',
      'Unlimited tattoo uploads',
      'Automatic cloud backup',
      '7 color themes to choose from',
      'Responsive design — mobile + desktop',
      'Support for initial setup',
    ],
    included: "What you get",
    back: '← Back',
    errorDefault: 'Processing error. Please try again.',
    errorConnection: 'Connection error. Please try again.',
  },
} satisfies Record<Lang, unknown>;

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

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
      if (!res.ok) { setError(data.error || t.errorDefault); return; }
      window.location.href = data.url;
    } catch {
      setError(t.errorConnection);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full bg-zinc-950 border border-zinc-700 px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-500/60 transition-colors rounded-lg';
  const labelCls = 'block text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top bar */}
      <div className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-black tracking-tight">
          VITRINK<span className="text-orange-500">.APP</span>
        </Link>
        <Link to="/" className="text-xs text-zinc-600 hover:text-white transition-colors tracking-widest uppercase">
          {t.back}
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 items-start">

          {/* ─── LEFT: Plan Summary ─── */}
          <div className="order-2 lg:order-1 lg:sticky lg:top-8">

            {/* Plan card */}
            <div className="rounded-2xl border border-orange-500/25 bg-gradient-to-b from-orange-500/8 to-zinc-900/60 p-6 mb-8">
              <p className="text-[10px] font-bold tracking-widest uppercase text-orange-400 mb-3">{t.selectedPlan}</p>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-2xl font-black text-white uppercase tracking-wide">{planName}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">{artistLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white">{formatPrice(selectedPlan, currency)}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{t.perMonth}</p>
                </div>
              </div>
              {/* Currency selector */}
              <div className="flex gap-1.5 mb-4">
                {(['brl', 'usd', 'eur'] as Currency[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-lg border transition-all ${
                      currency === c
                        ? 'border-orange-500/60 text-orange-400 bg-orange-500/10'
                        : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
              <Link
                to="/#pricing"
                className="text-xs text-zinc-600 hover:text-orange-400 transition-colors"
              >
                {t.changePlan} →
              </Link>
            </div>

            {/* Features */}
            <div className="mb-8">
              <p className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-4">{t.included}</p>
              <ul className="space-y-3">
                {(t.features as string[]).map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-800">
              {(t.trust as { label: string; sub: string }[]).map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── RIGHT: Form ─── */}
          <div className="order-1 lg:order-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <h1 className="text-2xl font-black uppercase tracking-wide text-white mb-1">
                {t.title}
              </h1>
              <p className="text-xs text-zinc-600 tracking-widest uppercase mb-8">
                {t.badge}
              </p>

              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Studio name */}
                <div>
                  <label className={labelCls}>{t.labelName}</label>
                  <input
                    type="text"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    required
                    placeholder={t.placeholderName}
                    className={inputCls}
                  />
                </div>

                {/* Subdomain */}
                <div>
                  <label className={labelCls}>{t.labelSubdomain}</label>
                  <div className="flex items-stretch rounded-lg border border-zinc-700 focus-within:border-orange-500/60 transition-colors overflow-hidden">
                    <input
                      type="text"
                      value={subdomain}
                      onChange={(e) => handleSubdomainInput(e.target.value)}
                      required
                      minLength={3}
                      maxLength={30}
                      placeholder={t.placeholderSubdomain}
                      className="flex-1 bg-zinc-950 px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none"
                    />
                    <span className="flex items-center px-3 bg-zinc-800/80 text-zinc-500 text-xs font-mono whitespace-nowrap border-l border-zinc-700">
                      .vitrink.app
                    </span>
                  </div>
                  {subdomain && (
                    <p className="mt-2 text-[11px] text-zinc-600">
                      {t.subdomainHint}{' '}
                      <span className="text-orange-400 font-semibold">{subdomain}.vitrink.app</span>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className={labelCls}>{t.labelEmail}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t.placeholderEmail}
                    className={inputCls}
                  />
                  <p className="mt-2 text-[11px] text-zinc-600">{t.emailHint}</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 mt-2"
                  style={{ background: 'linear-gradient(135deg, #ff4500, #ff8c00)', color: '#fff' }}
                >
                  {loading ? t.btnLoading : t.btnSubmit}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

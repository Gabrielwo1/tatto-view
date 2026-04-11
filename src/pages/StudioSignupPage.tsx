import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang, type Lang } from '../lib/useLang';

const PRICES = {
  BRL: { id: 'price_1THVoi1DbauQaCosZKmpzwcn', symbol: 'R$', amount: '39', label: 'R$ 39/mês' },
  USD: { id: 'price_1TKq4j1DbauQaCosGucUXHLZ', symbol: 'US$', amount: '20', label: 'US$ 20/mo' },
  EUR: { id: 'price_1TKq5Z1DbauQaCos5zmmtJ35', symbol: '€', amount: '20', label: '€20/mo' },
} as const;

type Currency = keyof typeof PRICES;

const ALLOWED_PRICE_IDS = new Set(Object.values(PRICES).map((p) => p.id));

function detectCurrency(): Currency {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  const lang = navigator.language ?? '';
  const brTimezones = [
    'America/Sao_Paulo', 'America/Fortaleza', 'America/Recife',
    'America/Belem', 'America/Manaus', 'America/Cuiaba', 'America/Porto_Velho',
    'America/Boa_Vista', 'America/Santarem', 'America/Maceio', 'America/Bahia',
  ];
  if (brTimezones.includes(tz) || lang === 'pt-BR') return 'BRL';
  if (tz.startsWith('Europe/')) return 'EUR';
  return 'USD';
}

const T = {
  pt: {
    title: 'Criar seu studio',
    badge: '15 dias grátis · Sem cobrança imediata',
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
      { label: '15 dias', sub: 'grátis' },
      { label: 'Cancele', sub: 'quando quiser' },
      { label: 'Stripe', sub: 'pagamento seguro' },
    ],
    back: '← Voltar',
    errorDefault: 'Erro ao processar. Tente novamente.',
    errorConnection: 'Erro de conexão. Tente novamente.',
  },
  en: {
    title: 'Create your studio',
    badge: '15 days free · No immediate charge',
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
      { label: '15 days', sub: 'free' },
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

  const [studioName, setStudioName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>('BRL');

  useEffect(() => {
    setCurrency(detectCurrency());
  }, []);

  const price = PRICES[currency];

  function handleSubdomainInput(value: string) {
    setSubdomain(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ALLOWED_PRICE_IDS.has(price.id)) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/create-studio-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studioName, subdomain, email, priceId: price.id }),
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
          <img src="/vitrinklogo.png" alt="Vitrink" className="h-24 object-contain" />
        </Link>

        <div className="border border-white/10 bg-black/40 p-8">
          <h1 className="font-display text-3xl uppercase tracking-wide text-white mb-1">
            {t.title}
          </h1>
          <p className="font-body text-xs text-gray-500 tracking-widest uppercase mb-6">
            {t.badge}
          </p>

          {/* Currency selector */}
          <div className="flex gap-2 mb-6">
            {(Object.keys(PRICES) as Currency[]).map((c) => (
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
                {c} · {PRICES[c].symbol}{PRICES[c].amount}
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

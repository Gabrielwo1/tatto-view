import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const publicLogin = useStore((s) => s.publicLogin);
  const publicRegister = useStore((s) => s.publicRegister);
  const customLogo = useStore((s) => s.customLogo);
  const logoSrc = customLogo ?? '/logosemo-3.png';
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const result = await publicLogin(email, password);
        if (!result) { setError('Email ou senha incorretos.'); return; }
        // Artists/admins go to admin panel
        if (result === 'admin' || result === 'artist' || result === 'merch_manager') {
          navigate('/admin');
        } else {
          navigate(-1);
        }
      } else {
        const ok = await publicRegister(email, password, name);
        if (!ok) { setError('Não foi possível criar a conta. Tente outro email.'); return; }
        setSuccess('Conta criada! Verifique seu email para confirmar.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex justify-center mb-8">
          <img src={logoSrc} alt="Logo" className="h-16 object-contain" />
        </Link>

        <div className="border border-white/10 bg-black/40 p-8">
          <h1 className="font-display text-3xl uppercase tracking-wide text-white mb-1">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h1>
          <p className="font-body text-xs text-gray-600 tracking-widest uppercase mb-6">
            {mode === 'login' ? 'Acesse sua conta' : 'Cadastre-se gratuitamente'}
          </p>

          {success && (
            <div className="mb-4 px-4 py-3 border border-green-500/30 bg-green-500/10">
              <p className="font-body text-xs text-green-400">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 border border-red-500/30 bg-red-500/10">
              <p className="font-body text-xs text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome"
                  className="w-full bg-transparent border border-white/15 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full bg-transparent border border-white/15 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white/50 transition-colors"
              />
            </div>

            <div>
              <label className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-transparent border border-white/15 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-body text-xs font-bold tracking-widest uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <p className="font-body text-xs text-gray-600">
                Não tem conta?{' '}
                <button onClick={() => { setMode('register'); setError(null); }} className="text-white hover:text-ink-400 transition-colors">
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p className="font-body text-xs text-gray-600">
                Já tem conta?{' '}
                <button onClick={() => { setMode('login'); setError(null); }} className="text-white hover:text-ink-400 transition-colors">
                  Entrar
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="font-body text-xs text-gray-700 hover:text-white transition-colors tracking-widest uppercase">
            ← Voltar à vitrine
          </Link>
        </p>
      </div>
    </div>
  );
}

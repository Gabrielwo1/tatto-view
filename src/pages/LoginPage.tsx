import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const publicLogin = useStore((s) => s.publicLogin);
  const publicRegister = useStore((s) => s.publicRegister);
  const customLogo = useStore((s) => s.customLogo);
  const dataLoaded = useStore((s) => s.dataLoaded);
  const logoSrc = dataLoaded ? (customLogo ?? '/logosemo-1.png') : null;
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    setGoogleLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const { role, error: loginError } = await publicLogin(email, password);
        if (loginError) { setError(loginError); return; }

        // Artists/admins go to admin panel
        if (role === 'admin' || role === 'artist' || role === 'merch_manager') {
          navigate('/admin');
        } else {
          navigate(-1);
        }
      } else {
        const { success: regSuccess, error: regError } = await publicRegister(email, password, name);
        if (!regSuccess) { setError(regError || 'Erro ao criar conta.'); return; }
        setSuccess('Conta criada! Verifique seu email para confirmar.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex justify-center mb-8 h-16 items-center">
          {logoSrc && <img src={logoSrc} alt="Logo" className="h-16 object-contain" />}
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-transparent border border-white/15 px-4 py-3 pr-12 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-body text-xs font-bold tracking-widest uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>


          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-body text-xs text-gray-600 uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full mt-4 flex items-center justify-center gap-3 border border-white/15 hover:border-white/40 disabled:opacity-50 py-3 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-body text-xs font-bold tracking-widest uppercase text-white/70">
              {googleLoading ? '...' : 'Entrar com Google'}
            </span>
          </button>

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

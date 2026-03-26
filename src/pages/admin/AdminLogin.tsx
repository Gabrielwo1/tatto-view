import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const login           = useStore((s) => s.login);
  const isAdmin         = useStore((s) => s.isAdmin);
  const isArtist        = useStore((s) => s.isArtist);
  const isMerchManager  = useStore((s) => s.isMerchManager);
  const isContentEditor = useStore((s) => s.isContentEditor);
  const customLogo      = useStore((s) => s.customLogo);
  const navigate        = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const [showReset, setShowReset]       = useState(false);
  const [resetEmail, setResetEmail]     = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent]       = useState(false);

  if (isAdmin)         { navigate('/admin/dashboard',  { replace: true }); return null; }
  if (isArtist)        { navigate('/admin/tatuagens',  { replace: true }); return null; }
  if (isMerchManager)  { navigate('/admin/merchs',     { replace: true }); return null; }
  if (isContentEditor) { navigate('/admin/guests',     { replace: true }); return null; }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/admin', { replace: true });
    } else {
      setError('Email ou senha incorretos.');
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    const { error } = await supabase!.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      setError('Erro ao enviar email. Verifique o endereço e tente novamente.');
    } else {
      setResetSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src={customLogo ?? '/logosemo-3.png'} alt="El Dude" className="h-16 w-auto object-contain mx-auto mb-4" />
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600">
            Painel Administrativo
          </p>
        </div>

        {!showReset ? (
          <form onSubmit={handleSubmit} className="border border-white/10 p-8">
            <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-8">Entrar</h2>

            {error && (
              <div className="mb-6 px-4 py-3 border border-white/20 text-white/60 text-xs font-body tracking-wide">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={() => { setShowReset(true); setError(''); }}
              className="w-full mt-3 text-center font-body text-xs text-gray-600 hover:text-white transition-colors py-1"
            >
              Esqueci a senha
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="border border-white/10 p-8">
            <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-2">Recuperar Senha</h2>
            <p className="font-body text-xs text-gray-500 mb-8">
              Insira seu email para receber o link de redefinição.
            </p>

            {error && (
              <div className="mb-6 px-4 py-3 border border-white/20 text-white/60 text-xs font-body tracking-wide">
                {error}
              </div>
            )}

            {resetSent ? (
              <div className="px-4 py-3 border border-white/20 text-white/60 text-xs font-body tracking-wide">
                Email enviado! Verifique sua caixa de entrada.
              </div>
            ) : (
              <>
                <div>
                  <label className="block font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full mt-8 bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors"
                >
                  {resetLoading ? 'Enviando...' : 'Enviar link'}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => { setShowReset(false); setResetSent(false); setError(''); }}
              className="w-full mt-3 text-center font-body text-xs text-gray-600 hover:text-white transition-colors py-1"
            >
              ← Voltar ao login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

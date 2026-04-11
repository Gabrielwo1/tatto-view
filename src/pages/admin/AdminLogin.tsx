import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../lib/useLang';

const T = {
  pt: {
    panel: 'Painel Administrativo',
    title: 'Entrar',
    password: 'Senha',
    loading: 'Entrando...',
    submit: 'Entrar',
    wrongCredentials: 'Email ou senha incorretos.',
    forgotPassword: 'Esqueci a senha',
    resetTitle: 'Recuperar Senha',
    resetSubtitle: 'Insira seu email para receber o link de redefinição.',
    resetLoading: 'Enviando...',
    resetSubmit: 'Enviar link',
    resetSent: 'Email enviado! Verifique sua caixa de entrada.',
    resetError: 'Erro ao enviar email. Verifique o endereço e tente novamente.',
    backToLogin: '← Voltar ao login',
    showPassword: 'Mostrar senha',
    hidePassword: 'Ocultar senha',
  },
  en: {
    panel: 'Admin Panel',
    title: 'Sign In',
    password: 'Password',
    loading: 'Signing in...',
    submit: 'Sign In',
    wrongCredentials: 'Incorrect email or password.',
    forgotPassword: 'Forgot password',
    resetTitle: 'Reset Password',
    resetSubtitle: 'Enter your email to receive the reset link.',
    resetLoading: 'Sending...',
    resetSubmit: 'Send link',
    resetSent: 'Email sent! Check your inbox.',
    resetError: 'Error sending email. Please check the address and try again.',
    backToLogin: '← Back to login',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
};

export default function AdminLogin() {
  const login          = useStore((s) => s.login);
  const isAdmin        = useStore((s) => s.isAdmin);
  const isArtist       = useStore((s) => s.isArtist);
  const isMerchManager = useStore((s) => s.isMerchManager);
  const customLogo     = useStore((s) => s.customLogo);
  const logoSrc        = customLogo ?? '/logosemo-3.png';
  const navigate       = useNavigate();
  const { lang } = useLang();
  const t = T[lang];

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const [showReset, setShowReset]       = useState(false);
  const [resetEmail, setResetEmail]     = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent]       = useState(false);

  if (isAdmin)        { navigate('/admin/dashboard',  { replace: true }); return null; }
  if (isArtist)       { navigate('/admin/tatuagens',  { replace: true }); return null; }
  if (isMerchManager) { navigate('/admin/merchs',     { replace: true }); return null; }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/admin', { replace: true });
    } else {
      setError(t.wrongCredentials);
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
      setError(t.resetError);
    } else {
      setResetSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src={logoSrc} alt="Logo" className="h-16 w-auto object-contain mx-auto mb-4" />
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600">
            {t.panel}
          </p>
        </div>

        {!showReset ? (
          <form onSubmit={handleSubmit} className="border border-white/10 p-8">
            <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-8">{t.title}</h2>

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
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full bg-transparent border border-white/20 px-4 py-3 pr-12 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                    title={showPassword ? t.hidePassword : t.showPassword}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors"
            >
              {loading ? t.loading : t.submit}
            </button>

            <button
              type="button"
              onClick={() => { setShowReset(true); setError(''); }}
              className="w-full mt-3 text-center font-body text-xs text-gray-600 hover:text-white transition-colors py-1"
            >
              {t.forgotPassword}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="border border-white/10 p-8">
            <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-2">{t.resetTitle}</h2>
            <p className="font-body text-xs text-gray-500 mb-8">
              {t.resetSubtitle}
            </p>

            {error && (
              <div className="mb-6 px-4 py-3 border border-white/20 text-white/60 text-xs font-body tracking-wide">
                {error}
              </div>
            )}

            {resetSent ? (
              <div className="px-4 py-3 border border-white/20 text-white/60 text-xs font-body tracking-wide">
                {t.resetSent}
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
                  {resetLoading ? t.resetLoading : t.resetSubmit}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => { setShowReset(false); setResetSent(false); setError(''); }}
              className="w-full mt-3 text-center font-body text-xs text-gray-600 hover:text-white transition-colors py-1"
            >
              {t.backToLogin}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

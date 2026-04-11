import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../lib/useLang';

const T = {
  pt: {
    panelLabel: 'Painel Administrativo',
    title: 'Nova Senha',
    waitingLink: 'Aguardando validação do link... Se esta página não carregar, volte ao email e clique no link novamente.',
    subtitle: 'Defina sua nova senha abaixo.',
    newPasswordLabel: 'Nova senha',
    confirmPasswordLabel: 'Confirmar senha',
    saving: 'Salvando...', save: 'Salvar nova senha',
    errMismatch: 'As senhas não coincidem.',
    errTooShort: 'A senha deve ter pelo menos 6 caracteres.',
    errUpdate: 'Erro ao atualizar a senha. Tente novamente.',
  },
  en: {
    panelLabel: 'Admin Panel',
    title: 'New Password',
    waitingLink: 'Waiting for link validation... If this page does not load, go back to your email and click the link again.',
    subtitle: 'Set your new password below.',
    newPasswordLabel: 'New password',
    confirmPasswordLabel: 'Confirm password',
    saving: 'Saving...', save: 'Save new password',
    errMismatch: 'Passwords do not match.',
    errTooShort: 'Password must be at least 6 characters.',
    errUpdate: 'Error updating password. Please try again.',
  },
};

export default function AdminResetPassword() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const tr = T[lang];
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [ready, setReady]         = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    const checkFlow = async () => {
      if (!supabase) return;
      // ── Strategy 1: PKCE flow — URL contains ?code=XXX ───────────────────
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) setReady(true);
      }

      // ── Strategy 2: Implicit flow — URL hash contains #type=recovery ─────
      if (window.location.hash.includes('type=recovery')) {
        setReady(true);
      }

      // ── Strategy 3: Session already established ───────────────────────
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setReady(true);
    };

    checkFlow();

    // ── Strategy 4: Listen for the event if it fires after mount ──────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
      if (event === 'SIGNED_IN' && session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(tr.errMismatch);
      return;
    }
    if (password.length < 6) {
      setError(tr.errTooShort);
      return;
    }
    setLoading(true);
    const { error } = await supabase!.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(tr.errUpdate);
    } else {
      await supabase!.auth.signOut();
      navigate('/admin/login', { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src="/logosemo-3.png" alt="El Dude" className="h-16 w-auto object-contain mx-auto mb-4" />
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600">
            {tr.panelLabel}
          </p>
        </div>

        <div className="border border-white/10 p-8">
          <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-2">{tr.title}</h2>

          {!ready ? (
            <p className="font-body text-xs text-gray-500 mt-4">
              {tr.waitingLink}
            </p>
          ) : (
            <>
              <p className="font-body text-xs text-gray-500 mb-8">
                {tr.subtitle}
              </p>

              {error && (
                <div className="mb-6 px-4 py-3 border border-white/20 text-white/60 text-xs font-body tracking-wide">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
                    {tr.newPasswordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-transparent border border-white/20 px-4 py-3 pr-11 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPass ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
                    {tr.confirmPasswordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="w-full bg-transparent border border-white/20 px-4 py-3 pr-11 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showConfirm ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors"
                >
                  {loading ? tr.saving : tr.save}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

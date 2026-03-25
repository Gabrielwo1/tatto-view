import { useState, useEffect, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [ready, setReady]         = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    // Supabase fires PASSWORD_RECOVERY when the user arrives via the reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const { error } = await supabase!.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError('Erro ao atualizar a senha. Tente novamente.');
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
            Painel Administrativo
          </p>
        </div>

        <div className="border border-white/10 p-8">
          <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-2">Nova Senha</h2>

          {!ready ? (
            <p className="font-body text-xs text-gray-500 mt-4">
              Aguardando validação do link... Se esta página não carregar, volte ao email e clique no link novamente.
            </p>
          ) : (
            <>
              <p className="font-body text-xs text-gray-500 mb-8">
                Defina sua nova senha abaixo.
              </p>

              {error && (
                <div className="mb-6 px-4 py-3 border border-white/20 text-white/60 text-xs font-body tracking-wide">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
                    Nova senha
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
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
                    Confirmar senha
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
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors"
                >
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [ready, setReady]         = useState(false);

  useEffect(() => {
    // Supabase dispara PASSWORD_RESET quando o link de recuperação é seguido
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RESET') {
        setReady(true);
      }
    });

    // Também verifica se o Supabase já processou o hash da URL e criou sessão
    supabase!.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase!.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError('Erro ao atualizar senha. O link pode ter expirado — solicite um novo.');
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/admin/login'), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src="/eldude-nova-logo.png" alt="El Dude" className="h-16 w-auto object-contain mx-auto mb-4" />
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600">
            Redefinir Senha
          </p>
        </div>

        {success ? (
          <div className="border border-white/10 p-8 text-center space-y-2">
            <p className="font-body text-sm text-white/70">Senha atualizada com sucesso!</p>
            <p className="font-body text-xs text-gray-600">Redirecionando para o login...</p>
          </div>
        ) : ready ? (
          <form onSubmit={handleSubmit} className="border border-white/10 p-8">
            <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-8">Nova Senha</h2>

            {error && (
              <div className="mb-6 px-4 py-3 border border-white/20 text-white/60 text-xs font-body tracking-wide">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
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
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        ) : (
          <div className="border border-white/10 p-8 text-center">
            <p className="font-body text-xs text-gray-600 tracking-widest uppercase">
              Verificando link de recuperação...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

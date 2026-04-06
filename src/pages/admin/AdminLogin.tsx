import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function AdminLogin() {
  const login = useStore((s) => s.login);
  const isAdmin = useStore((s) => s.isAdmin);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAdmin) {
    navigate('/admin/dashboard', { replace: true });
    return null;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = login(username, password);
    if (ok) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Usuário ou senha incorretos.');
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/eldude logo.png" alt="El Dude" className="h-16 w-auto object-contain mx-auto mb-4" />
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600">
            Painel Administrativo
          </p>
        </div>

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
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors"
                placeholder="admin"
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
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

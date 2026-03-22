import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = useStore((s) => s.isAdmin);
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="bg-black border-b border-white/10 sticky top-0 z-50">
      <div className="px-6 lg:px-10">
        <div
          className="relative flex items-center justify-between transition-all duration-500 ease-in-out"
          style={{ height: scrolled ? '64px' : '160px' }}
        >
          {/* Left: Menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 text-white/50 hover:text-white transition-colors z-10"
          >
            <div className="flex flex-col gap-1 w-5">
              <span className="block h-px bg-current" />
              <span className="block h-px bg-current" />
              <span className="block h-px bg-current w-3" />
            </div>
            <span className="font-body text-xs font-semibold tracking-widest uppercase">Menu</span>
          </button>

          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <img
              src="/logosemo-3.png"
              alt="El Dude"
              className="w-auto object-contain pointer-events-auto transition-all duration-500 ease-in-out"
              style={{ height: scrolled ? '40px' : '120px' }}
            />
          </Link>

          {/* Right: Admin / Logout */}
          {isAdmin ? (
            <div className="flex items-center gap-4 z-10">
              <Link
                to="/admin"
                className="font-body text-xs font-semibold tracking-widest uppercase text-white/40 hover:text-white transition-colors"
              >
                Admin
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-1.5 font-body text-xs font-semibold tracking-widest uppercase text-white/40 hover:text-red-400 transition-colors"
                title="Sair"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </div>
          ) : (
            <Link
              to="/admin"
              className="font-body text-xs font-semibold tracking-widest uppercase text-white/40 hover:text-white transition-colors z-10"
            >
              Admin
            </Link>
          )}
        </div>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="bg-black border-t border-white/10">
          <div className="px-6 lg:px-10 py-6 flex flex-col gap-1">
            {[
              { to: '/', label: 'Vitrine', end: true },
              { to: '/artistas', label: 'Artistas', end: false },
              { to: '/guests', label: 'Guests', end: false },
              { to: '/merchs', label: 'Merchs', end: false },
              { to: '/aftercare', label: 'Pós Tattoo', end: false },
              { to: '/sobre-nos', label: 'Sobre Nós', end: false },
            ].map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => { setMenuOpen(false); window.scrollTo(0, 0); }}
                className={({ isActive }) =>
                  `font-display text-4xl uppercase tracking-wide transition-colors leading-tight ${
                    isActive ? 'text-white' : 'text-white/50 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
